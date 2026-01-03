import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Catch } from '@/types/fish';
// FIREBASE IMPORTS
import { db } from '@/src/firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

interface CatchState {
  catches: Catch[];
  isLoading: boolean;
  error: string | null;
  loadCatches: (userId: string) => Promise<void>;
  addCatch: (newCatch: Catch) => Promise<void>;
  updateCatch: (id: string, updatedCatch: Partial<Catch>) => Promise<void>;
  deleteCatch: (id: string) => Promise<void>;
}

export const useCatchStore = create<CatchState>()(
  persist(
    (set, get) => ({
      catches: [],
      isLoading: false,
      error: null,
      
      loadCatches: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const catchesQuery = query(collection(db, 'catches'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(catchesQuery);
          const catches: Catch[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Catch));
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
      
      deleteCatch: async (id) => {
        try {
          await deleteDoc(doc(db, 'catches', id));
          set((state) => ({
            catches: state.catches.filter((c) => c.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting catch:', error);
        }
      },
    }),
    {
      name: 'fish-catches',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);