import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { VocabularyWord, SentenceAnalysis } from "@/types/vocabulary";
import { useVideosStore } from "@/store/videos";

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
  const { videos } = useVideosStore();

  const saveVocabulary = async ({ videoId, vocabulary }: SaveVocabParams) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) throw new Error('Video not found');

      const response = await fetch('http://localhost:5000/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          video_id: videoId,
          vocabulary: {
            word: vocabulary.word,
            translation: vocabulary.translation,
            pronunciation: vocabulary.pronunciation,
            partOfSpeech: vocabulary.partOfSpeech,
            examples: vocabulary.examples
          }
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
      const video = videos.find(v => v.id === videoId);
      if (!video) throw new Error('Video not found');

      console.log('sentence', sentence);

      const response = await fetch('http://localhost:5000/api/sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          video_id: videoId,
          sentence: {
            original: sentence.original,
            translation: sentence.translation,
            breakdown: sentence.breakdown,
            grammar: sentence.grammar,
            context: sentence.context,
            similarExamples: sentence.similarExamples
          }
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

  const deleteVocabulary = async (vocabId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/vocabulary/${vocabId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete vocabulary');

      toast({
        title: "🗑️ Word deleted",
        description: "Successfully removed from your collection.",
      });

      return true;
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
    try {
      const response = await fetch(`http://localhost:5000/api/sentences/${sentenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete sentence');

      toast({
        title: "🗑️ Sentence deleted",
        description: "Successfully removed from your collection.",
      });

      return true;
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