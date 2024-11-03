import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProgressItem = {
  completed: boolean;
  timestamp: number;
};

type LearningProgress = {
  vocabulary: Record<string, ProgressItem>;  // word -> progress
  sentences: Record<string, ProgressItem>;   // sentence -> progress
  exercises: Record<string, ProgressItem>;   // exercise -> progress
  overallProgress: number;
};

type LearningProgressStore = {
  progress: Record<string, LearningProgress>;  // sessionId -> progress
  updateProgress: (sessionId: string, type: keyof LearningProgress, itemId: string, completed: boolean) => void;
  getProgress: (sessionId: string) => LearningProgress;
  calculateOverallProgress: (sessionId: string) => number;
};

export const useLearningProgress = create<LearningProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      updateProgress: (sessionId, type, itemId, completed) => {
        set((state) => {
          const sessionProgress = state.progress[sessionId] || {
            vocabulary: {},
            sentences: {},
            exercises: {},
            overallProgress: 0,
          };

          const updatedProgress = {
            ...sessionProgress,
            [type]: {
              ...sessionProgress[type] as any,
              [itemId]: {
                completed,
                timestamp: Date.now(),
              },
            },
          };

          // Calculate new overall progress
          const totalItems = 
            Object.keys(updatedProgress.vocabulary).length +
            Object.keys(updatedProgress.sentences).length +
            Object.keys(updatedProgress.exercises).length;

          const completedItems = 
            Object.values(updatedProgress.vocabulary).filter(i => i.completed).length +
            Object.values(updatedProgress.sentences).filter(i => i.completed).length +
            Object.values(updatedProgress.exercises).filter(i => i.completed).length;

          updatedProgress.overallProgress = totalItems > 0 
            ? (completedItems / totalItems) * 100 
            : 0;

          return {
            progress: {
              ...state.progress,
              [sessionId]: updatedProgress,
            },
          };
        });
      },

      getProgress: (sessionId) => {
        return get().progress[sessionId] || {
          vocabulary: {},
          sentences: {},
          exercises: {},
          overallProgress: 0,
        };
      },

      calculateOverallProgress: (sessionId) => {
        const progress = get().progress[sessionId];
        if (!progress) return 0;

        const totalItems = 
          Object.keys(progress.vocabulary).length +
          Object.keys(progress.sentences).length +
          Object.keys(progress.exercises).length;

        const completedItems = 
          Object.values(progress.vocabulary).filter(i => i.completed).length +
          Object.values(progress.sentences).filter(i => i.completed).length +
          Object.values(progress.exercises).filter(i => i.completed).length;

        return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      },
    }),
    {
      name: 'learning-progress',
    }
  )
); 