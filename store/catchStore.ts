import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Catch } from '@/types/fish';

interface CatchState {
  catches: Catch[];
  addCatch: (newCatch: Catch) => void;
  updateCatch: (id: string, updatedCatch: Partial<Catch>) => void;
  deleteCatch: (id: string) => void;
}

export const useCatchStore = create<CatchState>()(
  persist(
    (set) => ({
      catches: [],
      addCatch: (newCatch) => 
        set((state) => ({ catches: [newCatch, ...state.catches] })),
      updateCatch: (id, updatedCatch) =>
        set((state) => ({
          catches: state.catches.map((c) => 
            c.id === id ? { ...c, ...updatedCatch } : c
          ),
        })),
      deleteCatch: (id) =>
        set((state) => ({
          catches: state.catches.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'fish-catches',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);