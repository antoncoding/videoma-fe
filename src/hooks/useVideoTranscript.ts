import { useState, useEffect } from 'react';

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

interface TranslationStatus {
  status: 'pending' | 'completed' | 'error';
  progress: number;
}

export function useVideoTranscript(videoUrl: string, audioLanguage: string, targetLanguage?: string) {
  const [data, setData] = useState<TranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [translationPages, setTranslationPages] = useState<Record<number, TranscriptItem[]>>({});
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

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

        setData(result);

        console.log('result.translation', result.translation);
        // If we have translation, start background loading of remaining pages
        if (result.translation?.pagination.total_pages > 1) {
          console.log('result.translation.pagination', result.translation.pagination);
          loadRemainingTranslations(result.translation.pagination);
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

  // Function to load remaining translation pages
  const loadRemainingTranslations = async (pagination: PaginationInfo) => {
    if (!targetLanguage || !videoUrl) return;

    setIsLoadingTranslation(true);
    const videoId = extractVideoId(videoUrl);

    console.log('')

    try {
      // First check translation status
      const statusResponse = await fetch(
        `http://localhost:5000/api/translate/status?video_id=${videoId}&source_language=${audioLanguage}&target_language=${targetLanguage}`
      );
      const statusData: TranslationStatus = await statusResponse.json();

      if (statusData.status === 'completed') {
        // Load all remaining pages
        const pagePromises = Array.from(
          { length: pagination.total_pages }, 
          (_, i) => i + 1
        )
          .filter(page => page > 1) // Skip first page as we already have it
          .map(async (page) => {
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
            
            const pageData = await response.json();
            return { 
              page, 
              data: pageData.data,
              pagination: pageData.pagination 
            };
          });

        // Load pages in parallel but process them in order
        const pages = await Promise.all(pagePromises);
        
        setTranslationPages(prev => {
          const newPages = { ...prev };
          pages.forEach(({ page, data }) => {
            newPages[page] = data;
          });
          return newPages;
        });

        // Update the main data with all translation pages
        setData(prev => {
          if (!prev?.translation) return prev;

          const allTranslations = [
            ...prev.translation.data,
            ...Object.values(translationPages).flat()
          ].sort((a, b) => a.start - b.start); // Ensure correct ordering

          return {
            ...prev,
            translation: {
              ...prev.translation,
              data: allTranslations,
              pagination: {
                ...prev.translation.pagination,
                current_page: prev.translation.pagination.total_pages,
                current_segment_end: allTranslations.length,
              }
            }
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
    data, 
    error, 
    loading: loading || isLoadingTranslation,
    isLoadingTranslation 
  };
}

function extractVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/);
  return match?.[1] || '';
}