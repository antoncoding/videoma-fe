// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ROUTES = {
  AUDIO: {
    GENERATE: `${API_BASE_URL}/api/audio/generate`,
    GET: (id: string) => `${API_BASE_URL}/api/audio/${id}`,
  },
  VOCABULARY: {
    LIST: `${API_BASE_URL}/api/vocabulary`,
    DELETE: (id: number) => `${API_BASE_URL}/api/vocabulary/${id}`,
  },
  SENTENCES: {
    LIST: `${API_BASE_URL}/api/sentences`,
    SAVE: (videoId: string) => `${API_BASE_URL}/api/sentences?video_id=${videoId}`,
    DELETE: (id: number) => `${API_BASE_URL}/api/sentences/${id}`,
  },
  TRANSCRIPT: {
    PROCESS: `${API_BASE_URL}/api/process`,
    TRANSLATE_STATUS: `${API_BASE_URL}/api/translate/status`,
    TRANSLATE: `${API_BASE_URL}/api/translate`,
  },
  LEARNING: {
    GENERATE: `${API_BASE_URL}/api/learning/generate`,
  },
}; 