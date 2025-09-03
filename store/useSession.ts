import { create } from "zustand";

interface SessionState {
  // Session tracking
  startTime: number | null;
  lastSaved: number | null;
  isWriting: boolean;
  writingStreak: number;
  totalWordsToday: number;
  
  // Current page stats (derived from workspace but cached for performance)
  wordCount: number;
  charCount: number;
  
  // Session actions
  startSession: () => void;
  endSession: () => void;
  updateWritingStatus: (isWriting: boolean) => void;
  updateStats: (wordCount: number, charCount: number) => void;
  markSaved: () => void;
  updateDailyStats: (wordsAdded: number) => void;
  resetDailyStats: () => void;
  
  // Utility functions
  getSessionDuration: () => number;
  getTodayStats: () => { words: number; duration: number };
}

export const useSession = create<SessionState>((set, get) => ({
  startTime: null,
  lastSaved: null,
  isWriting: false,
  writingStreak: 0,
  totalWordsToday: 0,
  wordCount: 0,
  charCount: 0,

  startSession: () => {
    const now = Date.now();
    set({
      startTime: now,
      lastSaved: null,
    });
  },

  endSession: () => {
    set({
      startTime: null,
      isWriting: false,
    });
  },

  updateWritingStatus: (isWriting: boolean) => {
    const { writingStreak } = get();
    set({
      isWriting,
      writingStreak: isWriting ? writingStreak + 1 : 0,
    });
  },

  updateStats: (wordCount: number, charCount: number) => {
    const prevWordCount = get().wordCount;
    const wordsAdded = Math.max(0, wordCount - prevWordCount);
    
    set({
      wordCount,
      charCount,
    });

    // Update daily stats if words were added
    if (wordsAdded > 0) {
      get().updateDailyStats(wordsAdded);
    }
  },

  markSaved: () => {
    set({
      lastSaved: Date.now(),
    });
  },

  updateDailyStats: (wordsAdded: number) => {
    const { totalWordsToday } = get();
    set({
      totalWordsToday: totalWordsToday + wordsAdded,
    });
  },

  resetDailyStats: () => {
    set({
      totalWordsToday: 0,
      writingStreak: 0,
    });
  },

  getSessionDuration: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Date.now() - startTime;
  },

  getTodayStats: () => {
    const { totalWordsToday } = get();
    const sessionDuration = get().getSessionDuration();
    return {
      words: totalWordsToday,
      duration: sessionDuration,
    };
  },
}));