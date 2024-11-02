import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioCache {
  [key: string]: number; // sentence_id -> audio_id mapping
}

interface AudioState {
  cache: AudioCache;
  addToCache: (sentenceId: number, audioId: number) => void;
  getFromCache: (sentenceId: number) => number | undefined;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      cache: {},
      addToCache: (sentenceId, audioId) => 
        set((state) => ({
          cache: {
            ...state.cache,
            [sentenceId]: audioId
          }
        })),
      getFromCache: (sentenceId) => get().cache[sentenceId],
    }),
    {
      name: 'audio-cache',
    }
  )
); 