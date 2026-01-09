import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';

// --- ADD THESE FIREBASE IMPORTS ---
import { auth, db } from '@/src/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteImage } from '@/utils/firebaseStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkUsernameAvailability: (username: string, excludeUserId?: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      checkUsernameAvailability: async (username: string, excludeUserId?: string) => {
        try {
          const usernameQuery = query(
            collection(db, 'users'),
            where('username', '==', username.toLowerCase())
          );
          const snapshot = await getDocs(usernameQuery);
          
          // If excluding a user (for edit profile), check if the username belongs to them
          if (excludeUserId && snapshot.docs.length === 1) {
            return snapshot.docs[0].id === excludeUserId;
          }
          
          // Username is available if no documents found
          return snapshot.empty;
        } catch (error) {
          console.error('Error checking username:', error);
          return false;
        }
      },
      
      signUp: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          // Check if username is already taken
          const usernameAvailable = await get().checkUsernameAvailability(username);
          if (!usernameAvailable) {
            throw new Error('Username is already taken. Please choose another one.');
          }

          // 1. Create User in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          const newUser: User = {
            id: firebaseUser.uid, // Use Firebase UID as the ID
            username: username.toLowerCase(),
            email,
            displayName: username,
            bio: '',
            profileImageUrl: null,
            followers: 0,
            following: 0,
            createdAt: new Date().toISOString(),
          };

          // 2. Save User Profile to Firestore
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          // 2. Fetch User Profile from Firestore
          const userDoc = await getDoc(doc(db, "users", uid));
          
          if (userDoc.exists()) {
            set({ 
              user: userDoc.data() as User, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            throw new Error("User profile not found in database.");
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      signOut: async () => {
        await firebaseSignOut(auth);
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          // If updating username, check if it's available
          if (updates.username && updates.username.toLowerCase() !== currentUser.username.toLowerCase()) {
            const usernameAvailable = await get().checkUsernameAvailability(updates.username, currentUser.id);
            if (!usernameAvailable) {
              throw new Error('Username is already taken. Please choose another one.');
            }
            // Normalize username to lowercase
            updates.username = updates.username.toLowerCase();
          }

          // If updating profile image with a NEW URL, delete the old one from Storage
          if (updates.profileImageUrl && currentUser.profileImageUrl && 
              updates.profileImageUrl !== currentUser.profileImageUrl) {
            try {
              await deleteImage(currentUser.profileImageUrl);
              console.log('Old profile image deleted from Storage');
            } catch (error) {
              console.warn('Failed to delete old profile image:', error);
              // Don't fail the update if old image deletion fails
            }
          }

          // Update Firestore user document
          const userRef = doc(db, "users", currentUser.id);
          await updateDoc(userRef, updates);

          // Update all posts by this user with new profile info
          if (updates.profileImageUrl || updates.displayName) {
            try {
              const postsQuery = query(collection(db, 'posts'), where('userId', '==', currentUser.id));
              const postsSnapshot = await getDocs(postsQuery);
              
              const postUpdatePromises = postsSnapshot.docs.map(async (postDoc) => {
                const postUpdates: any = {};
                if (updates.displayName) postUpdates.userDisplayName = updates.displayName;
                if (updates.profileImageUrl) postUpdates.userProfileImage = updates.profileImageUrl;
                
                if (Object.keys(postUpdates).length > 0) {
                  await updateDoc(doc(db, 'posts', postDoc.id), postUpdates);
                }
              });
              
              await Promise.all(postUpdatePromises);
              console.log('Updated user info in all posts');
            } catch (error) {
              console.warn('Failed to update posts with new profile info:', error);
              // Don't fail the profile update if post updates fail
            }

            // Update all comments by this user with new profile info
            try {
              const commentsQuery = query(collection(db, 'comments'), where('userId', '==', currentUser.id));
              const commentsSnapshot = await getDocs(commentsQuery);
              
              const commentUpdatePromises = commentsSnapshot.docs.map(async (commentDoc) => {
                const commentUpdates: any = {};
                if (updates.displayName) commentUpdates.userDisplayName = updates.displayName;
                if (updates.profileImageUrl) commentUpdates.userProfileImage = updates.profileImageUrl;
                
                if (Object.keys(commentUpdates).length > 0) {
                  await updateDoc(doc(db, 'comments', commentDoc.id), commentUpdates);
                }
              });
              
              await Promise.all(commentUpdatePromises);
              console.log('Updated user info in all comments');
            } catch (error) {
              console.warn('Failed to update comments with new profile info:', error);
            }
          }

          // Update local state
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null
          }));
        } catch (error: any) {
          console.error("Failed to update profile:", error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);