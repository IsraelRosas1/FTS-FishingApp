import { create } from 'zustand';
import { Catch } from '@/types/fish';

interface TempCatchState {
  tempCatches: Record<string, Catch>;
  addTempCatch: (catchData: Catch) => void;
  getTempCatch: (id: string) => Catch | undefined;
  removeTempCatch: (id: string) => void;
}

export const useTempCatchStore = create<TempCatchState>((set, get) => ({
  tempCatches: {},
  
  addTempCatch: (newCatch) => 
    set((state) => ({ 
      tempCatches: { ...state.tempCatches, [newCatch.id]: newCatch } 
    })),
  
  getTempCatch: (id) => {
    const state = get();
    return state.tempCatches[id];
  },
  
  removeTempCatch: (id) =>
    set((state) => {
      const newTempCatches = { ...state.tempCatches };
      delete newTempCatches[id];
      return { tempCatches: newTempCatches };
    }),
}));