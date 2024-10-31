import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface Subtitle {
  text: string;
  start: number;
  duration: number;
}

interface SaveSentenceParams {
  original: Subtitle;
  translation?: Subtitle;
  videoUrl: string;
  videoTitle: string;
  audioLanguage: string;
  targetLanguage: string;
  source: string;
  translationSource?: string;
}

export function useSentences() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSentence = async (params: SaveSentenceParams) => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    if (!session.accessToken) {
      setError("No access token available");
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('params.videoTitle', params.videoTitle)

    try {
      const response = await fetch("http://localhost:5000/api/sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          video_url: params.videoUrl,
          video_title: params.videoTitle,
          original_text: params.original.text,
          translated_text: params.translation?.text,
          timestamp: params.original.start,
          original_language: params.audioLanguage,
          target_language: params.targetLanguage,
          source: params.source,
          translation_source: params.translationSource
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save sentence');
      }

      return await response.json();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save sentence');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSentence = async (id: number) => {
    if (!session?.user) {
      signIn("google");
      return false;
    }

    if (!session.accessToken) {
      setError("No access token available");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/sentences/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sentence');
      }

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete sentence');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveSentence,
    deleteSentence,
    isLoading,
    error
  };
} 