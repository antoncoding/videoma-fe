import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningSession } from '@/types/vocabulary';

type SessionProgress = {
  completedItems: string[];  // Array of completed item IDs
  overallProgress: number;
  lastUpdated: number;
};

type LearningProgressStore = {
  progress: Record<string, SessionProgress>;  // sessionId -> progress
  initializeProgress: (sessionId: string, session: LearningSession) => void;
  toggleItemCompletion: (sessionId: string, itemId: string) => void;
  isItemCompleted: (sessionId: string, itemId: string) => boolean;
  getProgress: (sessionId: string) => SessionProgress;
  calculateOverallProgress: (sessionId: string, totalItems: number) => number;
};

export const useLearningProgress = create<LearningProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      initializeProgress: (sessionId, session) => {
        // Generate IDs for all items
        const allItemIds = [
          ...session.vocabulary.map((_, idx) => `word-${idx}`),
          ...session.sentences.map((_, idx) => `sentence-${idx}`),
          ...session.exercises.map((_, idx) => `exercise-${idx}`),
        ];

        set((state) => ({
          progress: {
            ...state.progress,
            [sessionId]: {
              completedItems: [],
              overallProgress: 0,
              lastUpdated: Date.now(),
            },
          },
        }));

        return allItemIds;
      },

      toggleItemCompletion: (sessionId, itemId) => {
        set((state) => {

          console.log('toggleItemCompletion', sessionId, itemId);

          const sessionProgress = state.progress[sessionId] || {
            completedItems: [],
            overallProgress: 0,
            lastUpdated: Date.now(),
          };

          const newCompletedItems = sessionProgress.completedItems.includes(itemId)
            ? sessionProgress.completedItems.filter(id => id !== itemId)
            : [...sessionProgress.completedItems, itemId];

          return {
            progress: {
              ...state.progress,
              [sessionId]: {
                ...sessionProgress,
                completedItems: newCompletedItems,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      isItemCompleted: (sessionId, itemId) => {
        const sessionProgress = get().progress[sessionId];
        return sessionProgress?.completedItems.includes(itemId) || false;
      },

      getProgress: (sessionId) => {
        return get().progress[sessionId] || {
          completedItems: [],
          overallProgress: 0,
          lastUpdated: Date.now(),
        };
      },

      calculateOverallProgress: (sessionId, totalItems) => {
        const sessionProgress = get().progress[sessionId];
        if (!sessionProgress || sessionProgress.completedItems === undefined) return 0;

        const completedCount = sessionProgress.completedItems.length;
        return totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
      },
    }),
    {
      name: 'learning-progress',
    }
  )
);