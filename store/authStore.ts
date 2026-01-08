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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      signUp: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Create User in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          const newUser: User = {
            id: firebaseUser.uid, // Use Firebase UID as the ID
            username,
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
          // If updating profile image, delete the old one from Storage
          if (updates.profileImageUrl && currentUser.profileImageUrl) {
            try {
              await deleteImage(currentUser.profileImageUrl);
              console.log('Old profile image deleted from Storage');
            } catch (error) {
              console.warn('Failed to delete old profile image:', error);
              // Don't fail the update if old image deletion fails
            }
          }

          // Update Firestore
          const userRef = doc(db, "users", currentUser.id);
          await updateDoc(userRef, updates);

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