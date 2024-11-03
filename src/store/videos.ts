import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Video = {
  id: string;
  url: string;
  customTitle: string;
  language: string;
};

export type VideosState = {
  videos: Video[];
  addVideo: (video: Video) => void;
  removeVideo: (id: string) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
};

export const useVideosStore = create<VideosState>()(
  persist(
    (set) => ({
      videos: [],
      addVideo: (video) => set((state) => ({ 
        videos: [...state.videos, video] 
      })),
      removeVideo: (id) => set((state) => ({ 
        videos: state.videos.filter((v) => v.id !== id) 
      })),
      updateVideo: (id, updates) => set((state) => ({
        videos: state.videos.map((video) => 
          video.id === id ? { ...video, ...updates } : video
        )
      })),
    }),
    {
      name: 'videos-storage',
    }
  )
); 