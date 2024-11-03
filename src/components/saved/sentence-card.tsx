import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Star, Clock, Volume2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useVideosStore } from "@/store/videos";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { useAudioStore } from '@/store/audio';
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import { getLanguageEmoji } from "@/constants/languages";
import { useVoiceStore } from "@/store/settings/voice";
interface SavedSentence {
  id: number;
  video_url: string;
  video_title: string;
  original_text: string;
  translated_text: string | null;
  timestamp: number;
  original_language: string;
  target_language: string;
  created_at: string;
  source: string;
  translation_source: string;
}

interface SentenceCardProps {
  sentence: SavedSentence;
  onDelete: (id: number) => void;
}

export function SentenceCard({ sentence, onDelete }: SentenceCardProps) {
  const { videos } = useVideosStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: session } = useSession();
  const { getVoiceForLanguage } = useVoiceStore();
  const { getFromCache, addToCache } = useAudioStore();

  // Try to find the video in our local store
  const videoId = sentence.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/)?.[1];
  const storedVideo = videoId ? videos.find(v => v.id === videoId) : null;

  const playAudio = async (text: string, language: string) => {
    if (isPlaying) {
      console.log('Stopping current audio');
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      const voice = getVoiceForLanguage(language);
      console.log('Using voice:', voice );

      // Check cache first
      let audioId = getFromCache(sentence.id);
      
      if (!audioId) {
        // Generate new audio if not in cache
        const generateResponse = await fetch("http://localhost:5000/api/audio/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            sentence: text,
            sentence_id: sentence.id,
            voice_id: voice,
          }),
        });

        if (!generateResponse.ok) {
          const errorData = await generateResponse.json();
          throw new Error(errorData.message || 'Failed to generate audio');
        }

        const { audio_id } = await generateResponse.json();
        console.log('Generated new audio ID:', audio_id);
        
        // Save to cache
        addToCache(sentence.id, audio_id);
        audioId = audio_id;
      } else {
        console.log('Using cached audio ID:', audioId);
      }

      // Fetch the audio file using the ID (either from cache or newly generated)
      const audioResponse = await fetch(`http://localhost:5000/api/audio/${audioId}`, {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      });

      if (!audioResponse.ok) {
        if (audioResponse.status === 404) {
          // If audio not found, remove from cache and try generating again
          console.log('Cached audio not found, regenerating...');
          addToCache(sentence.id, 0); // Clear cache
          throw new Error('Cached audio not found');
        }
        const errorData = await audioResponse.json();
        throw new Error(errorData.message || 'Failed to fetch audio');
      }

      // Get the audio blob from the response
      const audioBlob = await audioResponse.blob();
      console.log('Received audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      const url = URL.createObjectURL(audioBlob);
      console.log('Created URL:', url);

      if (audioRef.current) {
        // Clean up previous URL if it exists
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }

        audioRef.current.src = url;
        
        audioRef.current.onloadeddata = () => {
          console.log('Audio loaded, starting playback');
          audioRef.current?.play()
            .then(() => {
              console.log('Playback started');
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Playback failed:', error);
              setIsPlaying(false);
              toast({
                variant: "destructive",
                title: "❌ Error",
                description: "Failed to play audio",
              });
            });
        };
        
        audioRef.current.onerror = (e) => {
          console.error('Audio loading error:', e);
          setIsPlaying(false);
          setAudioLoading(false);
          toast({
            variant: "destructive",
            title: "❌ Error",
            description: "Failed to load audio",
          });
        };

        audioRef.current.onended = () => {
          console.log('Audio playback completed');
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };

        audioRef.current.onpause = () => {
          console.log('Audio paused');
          setIsPlaying(false);
        };
      }
    } catch (error) {
      console.error('Detailed error:', error);
      
      // If error was due to missing cached audio, retry once
      if (error instanceof Error && error.message === 'Cached audio not found') {
        console.log('Retrying audio generation...');
        playAudio(text, language);
        return;
      }

      toast({
        variant: "destructive",
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to generate audio",
      });
    } finally {
      setAudioLoading(false);
    }
  };

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        hidden
      />
      <div className="space-y-4">
        {/* Video info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(sentence.created_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            {storedVideo ? (
              <div className="flex items-center gap-1">
                <span className="truncate max-w-[200px]">{storedVideo.customTitle}</span>
              </div>
            ) : (
              <span className="truncate max-w-[200px]">{sentence.video_title}</span>
            )}
          </div>
        </div>

        {/* Original text */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getLanguageEmoji(sentence.original_language)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => playAudio(sentence.original_text, sentence.original_language)}
              disabled={audioLoading || !session}
            >
              {audioLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Volume2 className={cn(
                  "w-4 h-4",
                  isPlaying && "text-primary animate-pulse"
                )} />
              )}
            </Button>
          </div>
          <p className="text-lg font-serif leading-relaxed">{sentence.original_text}</p>
        </div>

        {/* Translation */}
        {sentence.translated_text && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLanguageEmoji(sentence.target_language)}</span>
            </div>
            <p className="text-muted-foreground">{sentence.translated_text}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {storedVideo ? (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/videos/${storedVideo.id}?t=${Math.floor(sentence.timestamp)}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch Again
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(
                `${sentence.video_url}?t=${Math.floor(sentence.timestamp)}`,
                '_blank'
              )}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Watch on YouTube
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(sentence.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
} 