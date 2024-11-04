import { API_ROUTES } from './api';
import { VocabularyWord, SentenceAnalysis } from '@/types/vocabulary';

export interface SavedVocabulary extends VocabularyWord {
  id: number;
  video_id: string;
  created_at: string;
}

export interface SavedSentence extends SentenceAnalysis {
  id: number;
  video_id: string;
  created_at: string;
}

export const SavedItemsService = {
  async fetchVocabulary(token: string): Promise<SavedVocabulary[]> {
    const response = await fetch(API_ROUTES.VOCABULARY.LIST, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch vocabulary');
    const data = await response.json();
    return data.vocabulary || [];
  },

  async fetchSentences(token: string): Promise<SavedSentence[]> {
    const response = await fetch(API_ROUTES.SENTENCES.LIST, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch sentences');
    const data = await response.json();
    return data.sentences || [];
  },

  async saveVocabulary(token: string, videoId: string, vocabulary: VocabularyWord): Promise<boolean> {
    const response = await fetch(API_ROUTES.VOCABULARY.LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        video_id: videoId,
        vocabulary,
      }),
    });
    
    return response.ok;
  },

  async saveSentence(token: string, videoId: string, sentence: SentenceAnalysis): Promise<boolean> {
    const response = await fetch(API_ROUTES.SENTENCES.LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        video_id: videoId,
        sentence,
      }),
    });
    
    return response.ok;
  },

  async deleteVocabulary(token: string, id: number): Promise<boolean> {
    const response = await fetch(API_ROUTES.VOCABULARY.DELETE(id), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.ok;
  },

  async deleteSentence(token: string, id: number): Promise<boolean> {
    const response = await fetch(API_ROUTES.SENTENCES.DELETE(id), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.ok;
  },
}; 