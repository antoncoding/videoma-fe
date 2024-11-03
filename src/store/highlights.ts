import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabularyHighlight } from '@/types/vocabulary';

interface HighlightsState {
  highlights: Record<string, VocabularyHighlight[]>; // videoId -> highlights
  addHighlight: (videoId: string, highlight: VocabularyHighlight) => void;
  removeHighlight: (videoId: string, content: string) => void;
  getHighlightsForVideo: (videoId: string) => VocabularyHighlight[];
}

export const useHighlightsStore = create<HighlightsState>()(
  persist(
    (set, get) => ({
      highlights: {},
      
      addHighlight: (videoId, highlight) => 
        set((state) => ({
          highlights: {
            ...state.highlights,
            [videoId]: [...(state.highlights[videoId] || []), highlight],
          },
        })),
      
      removeHighlight: (videoId, content) =>
        set((state) => ({
          highlights: {
            ...state.highlights,
            [videoId]: state.highlights[videoId]?.filter(h => h.content !== content) || [],
          },
        })),
      
      getHighlightsForVideo: (videoId) => 
        get().highlights[videoId] || [],
    }),
    {
      name: 'vocabulary-highlights',
    }
  )
); 