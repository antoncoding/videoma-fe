import { useState } from 'react';
import { useAudioStore } from '@/store/audio';
import { toast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { API_ROUTES } from '@/services/api';

export function useAudioPlayback() {
  const [isLoading, setIsLoading] = useState(false);
  const { playAudio, stopAudio, addToCache } = useAudioStore();
  const { data: session } = useSession();

  // Try to get cached audio by ID
  const getCachedAudioById = async (audioId: string): Promise<string | null> => {
    if (!session?.accessToken) return null;

    try {
      const response = await fetch(API_ROUTES.AUDIO.GET(audioId), {
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
        },
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      // Silently fail - we'll try generation instead
      return null;
    }
  };

  // Generate new audio and get its URL
  const generateNewAudio = async (
    text: string,
    voiceId: string,
    language: string
  ): Promise<{ audioUrl: string; audioId: string } | null> => {
    if (!session?.accessToken) return null;

    try {
      const response = await fetch(API_ROUTES.AUDIO.GENERATE, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      return {
        audioUrl: data.audioUrl,
        audioId: data.audioId,
      };
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Error generating audio",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    }
  };

  const playTextWithAudio = async (
    text: string,
    voiceId: string,
    language: string,
    localId: string
  ) => {
    if (!session?.accessToken) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use audio features",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First attempt: Try to get cached audio if we have an ID
      const cachedAudioId = useAudioStore.getState().getFromCache(localId);
      
      if (cachedAudioId) {
        const cachedAudioUrl = await getCachedAudioById(cachedAudioId);
        if (cachedAudioUrl) {
          playAudio(cachedAudioUrl);
          setIsLoading(false);
          return;
        }
        // If cached audio fetch fails, silently fall through to generation
      }

      // Second attempt: Generate new audio
      const newAudio = await generateNewAudio(text, voiceId, language);
      if (newAudio) {
        playAudio(newAudio.audioUrl);
        // Cache the new audio ID
        addToCache(localId, newAudio.audioId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    playTextWithAudio,
    stopAudio,
    isLoading,
  };
} 