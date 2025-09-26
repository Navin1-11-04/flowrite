"use client";

import { create } from "zustand";
// Remove persist for testing
// import { persist } from "zustand/middleware";

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
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
  setLoading: (loading?: boolean) => void;
  setError: (error: AuthError) => void;
  clearError: () => void;
};

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  authState: 'loading',
  error: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => {
    console.log("🏪 Store: setUser called with:", user);
    const newState = {
      user, 
      authState: user ? 'authenticated' as AuthState : 'unauthenticated' as AuthState,
      error: null,
      isLoading: false,
      isAuthenticated: user ? true : false
    };
    set(newState);
    console.log("🏪 Store: New state after setUser:", get());
  },
  
  clearUser: () => {
    console.log("🏪 Store: clearUser called");
    set({ 
      user: null, 
      authState: 'unauthenticated',
      error: null,
      isLoading: false,
      isAuthenticated: false
    });
    console.log("🏪 Store: New state after clearUser:", get());
  },
  
  setLoading: (loading = true) => {
    console.log("🏪 Store: setLoading called with:", loading);
    const currentUser = get().user;
    set({ 
      authState: loading ? 'loading' : currentUser ? 'authenticated' : 'unauthenticated',
      error: null,
      isLoading: loading,
      isAuthenticated: loading ? false : currentUser ? true : false
    });
    console.log("🏪 Store: New state after setLoading:", get());
  },
  
  setError: (error) => {
    console.log("🏪 Store: setError called with:", error);
    set({ 
      error, 
      authState: 'error',
      isLoading: false,
      isAuthenticated: false
    });
  },
  
  clearError: () => {
    console.log("🏪 Store: clearError called");
    set({ error: null });
  },
}));