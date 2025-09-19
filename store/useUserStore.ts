"use client";

import { create } from "zustand";


export type UserData = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
};

type UserStore = {
  user: UserData | null;
  loading: boolean;
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
  setLoading: (state: boolean) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (state) => set({ loading: state }),
}));
