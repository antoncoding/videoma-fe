import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAudioStore } from '@/store/audio';
import { toast } from '@/components/ui/use-toast';
import { useVoiceStore } from '@/store/settings/voice';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: session } = useSession();
  const { getVoiceForLanguage } = useVoiceStore();
  const { getFromCache, addToCache } = useAudioStore();

  const playAudio = async (text: string, language: string, sentenceId?: number) => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    console.log('playAudio', text, language, sentenceId);

    setAudioLoading(true);
    try {
      const voice = getVoiceForLanguage(language);
      let audioId = sentenceId ? getFromCache(sentenceId) : null;
      
      if (!audioId) {
        const generateResponse = await fetch("http://localhost:5000/api/audio/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            sentence: text,
            sentence_id: sentenceId,
            voice_id: voice,
          }),
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to generate audio');
        }

        const { audio_id } = await generateResponse.json();
        if (sentenceId) {
          addToCache(sentenceId, audio_id);
        }
        audioId = audio_id;
      }

      const audioResponse = await fetch(`http://localhost:5000/api/audio/${audioId}`, {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      });

      if (!audioResponse.ok) {
        if (audioResponse.status === 404) {
          if (sentenceId) addToCache(sentenceId, 0);
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