import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';
import { generateUniqueId } from '@/utils/fishRecognition';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Mock user data for demo purposes
const MOCK_USER: User = {
  id: 'user-1',
  username: 'fisherman_joe',
  email: 'joe@example.com',
  displayName: 'Joe Fisher',
  bio: 'Passionate angler and nature lover. Fishing since 2010.',
  profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  followers: 245,
  following: 132,
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      signUp: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          // This would be replaced with actual API call to create user
          // For now, simulate a network request
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: generateUniqueId(),
            username,
            email,
            displayName: username,
            bio: '',
            profileImageUrl: null,
            followers: 0,
            following: 0,
            createdAt: new Date().toISOString(),
          };
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: 'Failed to create account. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // This would be replaced with actual API call to authenticate
          // For now, simulate a network request
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo, always return the mock user
          set({ 
            user: MOCK_USER, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: 'Invalid email or password. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      signOut: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);