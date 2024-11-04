import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { VocabularyWord, SentenceAnalysis } from "@/types/vocabulary";

interface SaveVocabParams {
  videoId: string;
  vocabulary: VocabularyWord;
}

interface SaveSentenceParams {
  videoId: string;
  sentence: SentenceAnalysis;
}

export function useSentenceManager() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const saveVocabulary = async ({ videoId, vocabulary }: SaveVocabParams) => {
    try {
      const response = await fetch('http://localhost:5000/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          videoId,
          vocabulary,
        }),
      });

      if (!response.ok) throw new Error('Failed to save vocabulary');

      toast({
        title: "✨ Word saved!",
        description: "Added to your collection for review later.",
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to save vocabulary. Please try again.",
      });
      return false;
    }
  };

  const saveSentence = async ({ videoId, sentence }: SaveSentenceParams) => {
    try {
      const response = await fetch('http://localhost:5000/api/sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          videoId,
          sentence,
        }),
      });

      if (!response.ok) throw new Error('Failed to save sentence');

      toast({
        title: "✨ Sentence saved!",
        description: "Added to your collection for review later.",
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to save sentence. Please try again.",
      });
      return false;
    }
  };

  return {
    saveVocabulary,
    saveSentence,
  };
} 