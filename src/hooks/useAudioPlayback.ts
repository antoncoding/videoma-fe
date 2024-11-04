import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAudioStore } from '@/store/audio';
import { toast } from '@/components/ui/use-toast';
import { useVoiceStore } from '@/store/settings/voice';
import { API_BASE_URL, API_ROUTES } from '@/services/api';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: session } = useSession();
  const { getVoiceForLanguage } = useVoiceStore();
  const { getFromCache, addToCache } = useAudioStore();

  const playAudio = async (text: string, language: string, uniqueId?: number) => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      const voice = getVoiceForLanguage(language);
      let audioId = uniqueId ? getFromCache(uniqueId) : null;
      
      if (!audioId) {
        const generateResponse = await fetch(API_ROUTES.AUDIO.GENERATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            sentence: text,
            sentence_id: uniqueId,
            voice_id: voice,
          }),
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to generate audio');
        }

        const { audio_id } = await generateResponse.json();
        if (uniqueId) {
          addToCache(uniqueId, audio_id);
        }
        audioId = audio_id as number;
      }

      const audioResponse = await fetch(API_ROUTES.AUDIO.GET(audioId.toString()), {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      });

      if (!audioResponse.ok) {
        if (audioResponse.status === 404) {
          if (uniqueId) addToCache(uniqueId, 0);
          throw new Error('Cached audio not found');
        }
        throw new Error('Failed to fetch audio');
      }

      const audioBlob = await audioResponse.blob();
      const url = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }

        audioRef.current.src = url;
        audioRef.current.onloadeddata = () => {
          audioRef.current?.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              toast({
                variant: "destructive",
                title: "❌ Error",
                description: "Failed to play audio",
              });
            });
        };
        
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          setAudioLoading(false);
          toast({
            variant: "destructive",
            title: "❌ Error",
            description: "Failed to load audio",
          });
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to generate audio",
      });
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  return {
    audioRef,
    isPlaying,
    audioLoading,
    playAudio,
  };
} 