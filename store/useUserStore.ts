"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserData = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  createdAt?: Date;
};

type AuthError = {
  code: string;
  message: string;
};

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

type UserStore = {
  user: UserData | null;
  authState: AuthState;
  error: AuthError | null;
  
  // Actions
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
  setLoading: () => void;
  setError: (error: AuthError) => void;
  clearError: () => void;
  
  // Computed
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      authState: 'loading',
      error: null,
      
      setUser: (user) => set({ 
        user, 
        authState: user ? 'authenticated' : 'unauthenticated',
        error: null 
      }),
      
      clearUser: () => set({ 
        user: null, 
        authState: 'unauthenticated',
        error: null 
      }),
      
    setLoading: (loading = true) => set({ 
  authState: loading ? 'loading' : 'unauthenticated',
  error: null 
}),

      
      setError: (error) => set({ 
        error, 
        authState: 'error' 
      }),
      
      clearError: () => set({ error: null }),
      
      // Computed properties
      get isLoading() {
        return get().authState === 'loading';
      },
      
      get isAuthenticated() {
        return get().authState === 'authenticated' && get().user !== null;
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ 
        user: state.user,
        authState: state.authState === 'authenticated' ? 'authenticated' : 'unauthenticated'
      }),
    }
  )
);