import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Video {
  id: string;         // YouTube video ID
  customTitle: string; // User-given title
  url: string;        // Full URL
  language: string;   // Original language
  addedAt: Date;
}

interface VideosState {
  videos: Video[];
  addVideo: (video: Omit<Video, 'addedAt'>) => void;
  updateVideoTitle: (id: string, newTitle: string) => void;
  removeVideo: (id: string) => void;
}

export const useVideosStore = create<VideosState>()(
  persist(
    (set) => ({
      videos: [],
      addVideo: (video) => 
        set((state) => ({
          videos: [
            { ...video, addedAt: new Date() },
            ...state.videos,
          ],
        })),
      updateVideoTitle: (id, newTitle) =>
        set((state) => ({
          videos: state.videos.map((video) =>
            video.id === id ? { ...video, customTitle: newTitle } : video
          ),
        })),
      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        })),
    }),
    {
      name: 'videos-storage',
    }
  )
); 