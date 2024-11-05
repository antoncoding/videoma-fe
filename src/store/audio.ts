import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioCache {
  [key: string]: number; // sentence_id -> audio_id mapping
}

interface AudioState {
  cache: AudioCache;
  addToCache: (localId: number, audioId: number) => void;
  getFromCache: (localId: number) => number | undefined;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      cache: {},
      addToCache: (localId, audioId) => 
        set((state) => ({
          cache: {
            ...state.cache,
            [localId]: audioId
          }
        })),
      getFromCache: (localId) => get().cache[localId],
    }),
    {
      name: 'audio-cache',
    }
  )
); 