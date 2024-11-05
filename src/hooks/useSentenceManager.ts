import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { SavedItemsService } from "@/services/saved-items";
import { SentenceAnalysis, VocabularyWord } from "@/types/vocabulary";

export function useSentenceManager() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const saveVocabulary = async (videoId: string, vocabulary: VocabularyWord) => {
    if (!session?.accessToken) return false;
    
    try {
      const success = await SavedItemsService.saveVocabulary(
        session.accessToken,
        videoId,
        vocabulary
      );

      if (success) {
        toast({
          title: "✨ Word saved!",
          description: "Added to your collection for review later.",
        });
      }

      return success;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to save vocabulary. Please try again.",
      });
      return false;
    }
  };

  const saveSentence = async (videoId: string, sentence: SentenceAnalysis) => {
    if (!session?.accessToken) return false;

    console.log('saving sentence',  videoId, sentence);
    
    try {
      const success = await SavedItemsService.saveSentence(
        session.accessToken,
        videoId,
        sentence
      );

      if (success) {
        toast({
          title: "✨ Sentence saved!",
          description: "Added to your collection for review later.",
        });
      }

      return success;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to save sentence. Please try again.",
      });
      return false;
    }
  };

  const deleteVocabulary = async (vocabId: number) => {
    if (!session?.accessToken) return false;
    
    try {
      const success = await SavedItemsService.deleteVocabulary(
        session.accessToken,
        vocabId
      );

      if (success) {
        toast({
          title: "🗑️ Word deleted",
          description: "Successfully removed from your collection.",
        });
      }

      return success;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to delete vocabulary. Please try again.",
      });
      return false;
    }
  };

  const deleteSentence = async (sentenceId: number) => {
    if (!session?.accessToken) return false;
    
    try {
      const success = await SavedItemsService.deleteSentence(
        session.accessToken,
        sentenceId
      );

      if (success) {
        toast({
          title: "🗑️ Sentence deleted",
          description: "Successfully removed from your collection.",
        });
      }

      return success;
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
    saveVocabulary,
    saveSentence,
    deleteVocabulary,
    deleteSentence,
  };
} 