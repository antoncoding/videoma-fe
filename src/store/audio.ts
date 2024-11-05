import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AudioCache = {
  [key: string]: string;
};

export type AudioState = {
  cache: AudioCache;
  currentAudio?: HTMLAudioElement;
  addToCache: (localId: string, audioId: string) => void;
  getFromCache: (localId: string) => string | undefined;
  playAudio: (url: string) => void;
  stopAudio: () => void;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      cache: {},
      currentAudio: undefined,

      addToCache: (localId, audioId) => 
        set((state) => ({
          cache: {
            ...state.cache,
            [localId]: audioId
          }
        })),

      getFromCache: (localId) => get().cache[localId],

      playAudio: (url) => {
        // Stop any currently playing audio
        get().stopAudio();

        // Create and play new audio
        const audio = new Audio(url);
        audio.play();
        set({ currentAudio: audio });
      },

      stopAudio: () => {
        const { currentAudio } = get();
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        set({ currentAudio: undefined });
      },
    }),
    {
      name: 'audio-cache',
      // Only persist the cache, not the currentAudio
      partialize: (state) => ({ cache: state.cache }),
    }
  )
); 