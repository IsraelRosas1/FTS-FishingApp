import { create } from 'zustand';
import { Catch } from '@/types/fish';
// FIREBASE IMPORTS
import { db } from '@/src/firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { deleteImage } from '@/utils/firebaseStorage';

interface CatchState {
  catches: Catch[];
  isLoading: boolean;
  error: string | null;
  loadCatches: (userId: string) => Promise<void>;
  addCatch: (newCatch: Catch) => Promise<void>;
  updateCatch: (id: string, updatedCatch: Partial<Catch>) => Promise<void>;
  deleteCatch: (id: string, userId: string) => Promise<void>;
}

export const useCatchStore = create<CatchState>()((set, get) => ({
      catches: [],
      isLoading: false,
      error: null,
      
      loadCatches: async (userId) => {
        if (get().isLoading) return Promise.resolve();// 🛑 prevent race condition
  
        set({ isLoading: true, error: null });
        try {
          const catchesQuery = query(collection(db, 'catches'), where('userId', '==', userId));
          const querySnapshot = await getDocs(catchesQuery);
          const catches: Catch[] = querySnapshot.docs
          .map(docSnap => {
            const data = docSnap.data();
            if (!data.imageUri) return null; // ⛔ prevent ghost cards
            return {
              id: docSnap.id,
              ...data,
            } as Catch;
          })
          .filter((c): c is Catch => Boolean(c)); // Only include catches with userId
          // Sort by createdAt in descending order (most recent first)
          
          catches.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          set({ catches, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      addCatch: async (newCatch) => {
        try {
          const docRef = await addDoc(collection(db, 'catches'), newCatch);
          const catchWithId = { ...newCatch, id: docRef.id };
          set((state) => ({ catches: [catchWithId, ...state.catches] }));
        } catch (error) {
          console.error('Error adding catch:', error);
        }
      },
      
      updateCatch: async (id, updatedCatch) => {
        try {
          await updateDoc(doc(db, 'catches', id), updatedCatch);
          set((state) => ({
            catches: state.catches.map((c) => 
              c.id === id ? { ...c, ...updatedCatch } : c
            ),
          }));
        } catch (error) {
          console.error('Error updating catch:', error);
        }
      },
      
      deleteCatch: async (id, userId) => {
        try {
          // First, get the catch to access the image URL
          const catchToDelete = get().catches.find(c => c.id === id);
          
          // Delete from Firestore
          await deleteDoc(doc(db, 'catches', id));
          
          // Delete image from Firebase Storage if it exists
          if (catchToDelete?.imageUri) {
            try {
              await deleteImage(catchToDelete.imageUri);
            } catch (imageError) {
              console.warn('Failed to delete image from storage:', imageError);
              // Don't fail the whole operation if image deletion fails
            }
          }
          
          // Update local state
          set((state) => ({
            catches: state.catches.filter((c) => c !== catchToDelete),
          }));
        } catch (error) {
          console.error('Error deleting catch:', error);
          throw error;
        }
      },
    })
  );