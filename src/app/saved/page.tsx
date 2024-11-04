"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSentenceManager } from "@/hooks/useSentenceManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabularyWord, SentenceAnalysis } from "@/types/vocabulary";
import { VocabularyList } from "@/components/learning/vocabulary-list";
import { SentencesList } from "@/components/learning/sentences-list";

interface SavedVocabulary extends VocabularyWord {
  id: number;
  video_id: string;
  created_at: string;
}

interface SavedSentence extends SentenceAnalysis {
  id: number;
  video_id: string;
  created_at: string;
}

export default function SavedPage() {
  const [vocabularies, setVocabularies] = useState<SavedVocabulary[]>([]);
  const [sentences, setSentences] = useState<SavedSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchSavedItems();
    }
  }, [session?.accessToken]);

  const fetchSavedItems = async () => {
    try {
      // Fetch vocabularies
      const vocabResponse = await fetch("http://localhost:5000/api/vocabulary", {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      });

      // Fetch sentences
      const sentenceResponse = await fetch("http://localhost:5000/api/sentences", {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      });

      if (!vocabResponse.ok || !sentenceResponse.ok) {
        if (vocabResponse.status === 401 || sentenceResponse.status === 401) {
          signIn("google");
          return;
        }
        throw new Error('Failed to fetch saved items');
      }

      const vocabData = await vocabResponse.json();
      console.log('vocabData', vocabData);
      const sentenceData = await sentenceResponse.json();
      console.log('sentenceData', sentenceData);

      setVocabularies(vocabData.vocabulary);
      setSentences(sentenceData);
    } catch (error) {
      console.error("Error fetching saved items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto p-8">
      <h1 className="text-2xl mb-8">Saved Items</h1>
      
      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="vocabulary">
            Vocabulary ({vocabularies.length})
          </TabsTrigger>
          <TabsTrigger value="sentences">
            Sentences ({sentences.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-6">
          <VocabularyList 
            words={vocabularies}
            language="es" // You might want to get this from the vocabulary item
            onToggleComplete={() => {}} // No-op since we don't need completion here
            sessionId="saved" // Dummy session ID since we don't need progress tracking
            videoId="saved" // Dummy video ID
          />
        </TabsContent>

        <TabsContent value="sentences" className="space-y-6">
          <SentencesList 
            sentences={sentences}
            language="es" // You might want to get this from the sentence item
            onToggleComplete={() => {}} // No-op since we don't need completion here
            sessionId="saved" // Dummy session ID since we don't need progress tracking
            videoId="saved" // Dummy video ID
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 