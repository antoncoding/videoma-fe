import { useState, useEffect } from 'react';
import { TranscriptData } from '@/types/subtitle';

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface PaginationInfo {
  current_page: number;
  current_segment_start: number;
  current_segment_end: number;
  segments_per_page: number;
  total_pages: number;
}

interface TranscriptResponse {
  status: 'success' | 'error';
  transcription: {
    source: string;
    success: boolean;
    data: TranscriptItem[];
    pagination: PaginationInfo;
  };
  translation?: {
    source: string;
    success: boolean;
    data: TranscriptItem[];
    pagination: PaginationInfo;
  };
}

interface TranslationStatusResponse {
  status: 'success' | 'error';
  translated_pages: Array<{
    created_at: string;
    page: number;
  }>;
}

export function useVideoTranscript(videoUrl: string, audioLanguage: string, targetLanguage?: string) {
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [translationData, setTranslationData] = useState<TranscriptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  // Transform API response to VideoPlayer format
  const transformToTranscriptData = (
    data: TranscriptResponse['transcription']): TranscriptData => ({
    source: data.source,
    data: data.data,
  });

  // Initial transcript fetch
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

        // Transform and set transcript data
        setTranscriptData(transformToTranscriptData(result.transcription));
        
        // Set initial translation data if available
        if (result.translation) {
          setTranslationData(transformToTranscriptData(result.translation));
          
          // If we have more pages, start loading them
          if (result.translation.pagination.total_pages > 1) {
            loadRemainingTranslations(result.translation.pagination);
          }
        }
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

  const loadRemainingTranslations = async (pagination: PaginationInfo) => {
    if (!targetLanguage || !videoUrl) return;

    setIsLoadingTranslation(true);
    const videoId = extractVideoId(videoUrl);

    try {
      const statusResponse = await fetch(
        `http://localhost:5000/api/translate/status?video_id=${videoId}&source_language=${audioLanguage}&target_language=${targetLanguage}`
      );
      const statusData: TranslationStatusResponse = await statusResponse.json();

      if (statusData.status === 'success') {
        const completedPages = new Set(statusData.translated_pages.map(p => p.page));
        const pagesToFetch = Array.from(
          { length: pagination.total_pages }, 
          (_, i) => i + 1
        ).filter(page => page > 1 && !completedPages.has(page));

        // Load all completed pages
        const pagePromises = pagesToFetch.map(async (page) => {
          const response = await fetch('http://localhost:5000/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              video_id: videoId,
              target_language: targetLanguage,
              page
            }),
          });

          if (!response.ok) throw new Error(`Failed to fetch page ${page}`);
          return response.json();
        });

        // Load pages in parallel but process them in order
        const pages = await Promise.all(pagePromises);
        
        // Combine all translation data and update state
        setTranslationData(prev => {
          if (!prev) return prev;

          const allTranslations = [
            ...prev.data,
            ...pages.flatMap(page => page.translation.data)
          ].sort((a, b) => a.start - b.start);

          return {
            source: prev.source,
            data: allTranslations,
          };
        });
      }
    } catch (error) {
      console.error('Error loading translation pages:', error);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  return { 
    transcript: transcriptData,
    translation: translationData,
    error, 
    loading: loading || isLoadingTranslation,
    isLoadingTranslation 
  };
}

function extractVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/);
  return match?.[1] || '';
}