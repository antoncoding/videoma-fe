import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Star, Clock, Volume2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useVideosStore } from "@/store/videos";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAudioStore } from '@/store/audio';
import { getLanguageEmoji } from "@/constants/languages";
import { useVoiceStore } from "@/store/settings/voice";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { toast } from "@/hooks/use-toast";

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

  const { playAudio } = useAudioPlayback();

  // Try to find the video in our local store
  const videoId = sentence.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/)?.[1];
  const storedVideo = videoId ? videos.find(v => v.id === videoId) : null;

  const playAudioWithLoading = async (text: string, language: string) => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      await playAudio(text, language, sentence.id);
    } catch (error) {
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
              onClick={() => playAudioWithLoading(sentence.original_text, sentence.original_language)}
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