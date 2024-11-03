import { VocabularyHighlight, LearningSession } from '@/types/vocabulary';

interface GenerateSessionParams {
  highlights: VocabularyHighlight[];
  videoContext: {
    id: string;
    title: string;
    language: string;
    transcript: string;
  };
  userLevel: string;
}

export async function generateLearningSession(
  params: GenerateSessionParams,
  accessToken: string
): Promise<LearningSession> {

  
  const response = await fetch('http://localhost:5000/api/lesson/generate', {
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