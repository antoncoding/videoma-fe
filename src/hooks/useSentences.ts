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
  audioLanguage: string;
  targetLanguage: string;
  source: string;
  translationSource?: string;
}

export function useSentences() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSentence = async ({
    original,
    translation,
    videoUrl,
    audioLanguage,
    targetLanguage,
    source,
    translationSource
  }: SaveSentenceParams) => {
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

    try {
      const response = await fetch("http://localhost:5000/api/sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          video_url: videoUrl,
          video_title: document.title,
          original_text: original.text,
          translated_text: translation?.text,
          timestamp: original.start,
          original_language: audioLanguage,
          target_language: targetLanguage,
          source,
          translation_source: translationSource
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

  return {
    saveSentence,
    isLoading,
    error
  };
} 