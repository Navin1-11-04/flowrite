import { create } from "zustand";

interface SessionState {
  isWriting: boolean;
  setWriting: (v: boolean) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
  charCount: number;
  setCharCount: (count: number) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  lastSaved: number | null;
  setLastSaved: (time: number | null) => void;
}

export const useSession = create<SessionState>((set) => ({
  isWriting: false,
  setWriting: (v) => set({ isWriting: v }),
  wordCount: 0,
  setWordCount: (count) => set({ wordCount: count }),
  charCount: 0,
  setCharCount: (count) => set({ charCount: count }),
  startTime: null,
  setStartTime: (time) => set({ startTime: time }),
  lastSaved: null,
  setLastSaved: (time) => set({ lastSaved: time }),
}));
