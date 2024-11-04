import { VocabularyHighlight, LearningSession } from '@/types/vocabulary';
import { API_BASE_URL } from './api';

interface GenerateSessionParams {
  highlights: VocabularyHighlight[];
  videoContext: {
    id: string;
    title: string;
    language: string;
    transcript: string;
  };
  userLevel: string;
  tone: string;
  nonce?: string;
}

export async function generateLearningSession(
  params: GenerateSessionParams,
  accessToken: string
): Promise<{
  generation: {
    data: LearningSession;
    source: string;
  };
  status: string;
}> {

  
  const response = await fetch(`${API_BASE_URL}/api/lesson/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate learning session');
  }

  return response.json();
} 