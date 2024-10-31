import { useToast } from "@/components/ui/use-toast";
import { useSentences } from "./useSentences";
import { useVideosStore } from "@/store/videos";

interface Subtitle {
  text: string;
  start: number;
  duration: number;
}

interface SaveSentenceParams {
  original: Subtitle;
  translation?: Subtitle;
  videoUrl: string;
  videoTitle: string;
  videoId: string;
  timestamp: number;
  audioLanguage: string;
  targetLanguage: string;
  source: string;
}

export function useSentenceManager() {
  const { saveSentence, deleteSentence, isLoading, error } = useSentences();
  const { toast } = useToast();
  const { videos } = useVideosStore();

  const handleSaveSentence = async ({
    original,
    translation,
    videoUrl,
    videoId,
    timestamp,
    audioLanguage,
    targetLanguage,
    source,
  }: Omit<SaveSentenceParams, 'videoTitle'>) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    try {
      await saveSentence({
        original,
        translation,
        videoUrl,
        videoTitle: video.customTitle,
        audioLanguage,
        targetLanguage,
        source,
      });

      toast({
        title: "✨ Sentence saved!",
        description: "Added to your collection for review later.",
        className: "bg-primary text-primary-foreground",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to save sentence. Please try again.",
      });
    }
  };

  const handleDeleteSentence = async (id: number) => {
    try {
      const success = await deleteSentence(id);

      if (success) {
        toast({
          title: "🗑️ Sentence deleted",
          description: "Successfully removed from your collection.",
        });
        return true;
      } else {
        throw new Error('Failed to delete sentence');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to delete sentence. Please try again.",
      });
      return false;
    }
  };

  return {
    handleSaveSentence,
    handleDeleteSentence,
    isLoading,
    error,
  };
} 