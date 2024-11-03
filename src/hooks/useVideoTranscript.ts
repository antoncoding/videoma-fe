import { useState, useEffect } from 'react';

interface TranscriptResponse {
  status: 'success' | 'error';
  transcription: {
    source: string;
    success: boolean;
    data: Array<{
      text: string;
      start: number;
      duration: number;
    }>;
  };
  translation?: {
    source: string;
    success: boolean;
    data: Array<{
      text: string;
      start: number;
      duration: number;
    }>;
  };
}

export function useVideoTranscript(videoUrl: string, audioLanguage: string, targetLanguage?: string) {
  const [data, setData] = useState<TranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('audioLanguage', audioLanguage);
  console.log('targetLanguage', targetLanguage);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_url: videoUrl,
            audio_language: audioLanguage,
            target_language: targetLanguage,
          }),
        });

        const result = await response.json();
        
        if (result.status === 'error') {
          setError(result.message || 'Failed to fetch transcript');
          return;
        }

        setData(result);
      } catch (err) {
        setError('Failed to fetch transcript');
        console.error('Transcript fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (videoUrl) {
      fetchTranscript();
    }
  }, [videoUrl, audioLanguage, targetLanguage]);

  return { data, error, loading };
} 