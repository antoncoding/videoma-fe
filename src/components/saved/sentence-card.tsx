import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Star, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useVideosStore } from "@/store/videos";

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
  
  // Try to find the video in our local store
  const videoId = sentence.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/)?.[1];
  const storedVideo = videoId ? videos.find(v => v.id === videoId) : null;

  const getLanguageEmoji = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'es': return '🇪🇸';
      case 'en': return '🇬🇧';
      default: return '🌐';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
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
            <span className="text-sm text-muted-foreground">
              {sentence.source === "youtube" ? "YouTube" : "Whisper AI"}
            </span>
          </div>
          <p className="text-lg font-serif leading-relaxed">{sentence.original_text}</p>
        </div>

        {/* Translation */}
        {sentence.translated_text && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLanguageEmoji(sentence.target_language)}</span>
              <span className="text-sm text-muted-foreground">
                {sentence.translation_source === "youtube" ? "YouTube" : "AI Translated"}
              </span>
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
              <a href={`/videos/${storedVideo.id}?t=${Math.floor(sentence.timestamp)}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in App
              </a>
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