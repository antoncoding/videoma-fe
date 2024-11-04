import { useState, useEffect, useCallback } from 'react';
import { TranscriptData } from '@/types/subtitle';
import { API_ROUTES } from '@/services/api';

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

interface TranslationStatus {
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
  const [currentTranslationPage, setCurrentTranslationPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastLoadedTimestamp, setLastLoadedTimestamp] = useState(0);

  // Function to fetch a specific translation page
  const fetchTranslationPage = useCallback(async (page: number) => {
    if (!targetLanguage || !videoUrl) return null;
    
    const videoId = extractVideoId(videoUrl);
    try {
      const response = await fetch(API_ROUTES.TRANSCRIPT.TRANSLATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          source_language: audioLanguage,
          target_language: targetLanguage,
          page
        }),
      });

      if (!response.ok) throw new Error(`Failed to fetch page ${page}`);
      const result = await response.json();
      
      return {
        data: result.translation.data,
        pagination: result.translation.pagination
      };
    } catch (error) {
      console.error(`Error fetching translation page ${page}:`, error);
      return null;
    }
  }, [targetLanguage, videoUrl]);

  // Function to check if we need to load more translations
  const loadMoreTranslationsIfNeeded = useCallback(async (currentTimestamp: number) => {
    if (isLoadingTranslation || currentTranslationPage >= totalPages) return;

    // If we're within 30 seconds of the last loaded timestamp, load more
    const BUFFER_TIME = 30; // seconds
    if (currentTimestamp > (lastLoadedTimestamp - BUFFER_TIME)) {
      setIsLoadingTranslation(true);
      const nextPage = await fetchTranslationPage(currentTranslationPage + 1);
      
      if (nextPage) {
        setTranslationData(prev => {
          if (!prev) return prev;

          const allTranslations = [
            ...prev.data,
            ...nextPage.data
          ].sort((a, b) => a.start - b.start);

          return {
            ...prev,
            data: allTranslations,
          };
        });

        setCurrentTranslationPage(prev => prev + 1);
        setLastLoadedTimestamp(
          Math.max(...nextPage.data.map((item: TranscriptItem) => item.start + item.duration))
        );
      }
      setIsLoadingTranslation(false);
    }
  }, [isLoadingTranslation, currentTranslationPage, totalPages, lastLoadedTimestamp, fetchTranslationPage]);

  // Initial transcript and first translation page fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(API_ROUTES.TRANSCRIPT.PROCESS, {
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

        setTranscriptData({
          source: result.transcription.source,
          data: result.transcription.data,
        });
        
        if (result.translation) {
          setTranslationData({
            source: result.translation.source,
            data: result.translation.data,
          });
          
          setTotalPages(result.translation.pagination.total_pages);
          setLastLoadedTimestamp(
            Math.max(...result.translation.data.map((item: TranscriptItem) => item.start + item.duration))
          );
        }
      } catch (err) {
        setError('Failed to fetch transcript');
        console.error('Transcript fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (videoUrl) {
      fetchInitialData();
    }
  }, [videoUrl, audioLanguage, targetLanguage]);

  return { 
    transcript: transcriptData,
    translation: translationData,
    error, 
    loading: loading || isLoadingTranslation,
    isLoadingTranslation,
    loadMoreTranslationsIfNeeded,
  };
}

function extractVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/);
  return match?.[1] || '';
}