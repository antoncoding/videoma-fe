"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabularyWord, SentenceAnalysis } from "@/types/vocabulary";
import { VocabularyList } from "@/components/learning/vocabulary-list";
import { SentencesList } from "@/components/learning/sentences-list";
import { Loader2 } from "lucide-react";
import { API_ROUTES } from "@/services/api";

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
    // Only redirect if we're certain user is not authenticated
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        // Fetch vocabularies
        const vocabResponse = await fetch(API_ROUTES.VOCABULARY.LIST, {
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
          },
        });

        // Fetch sentences
        const sentenceResponse = await fetch(API_ROUTES.SENTENCES.LIST, {
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
          },
        });

        if (!vocabResponse.ok || !sentenceResponse.ok) {
          if (vocabResponse.status === 401 || sentenceResponse.status === 401) {
            signIn();
            return;
          }
          throw new Error('Failed to fetch saved items');
        }

        const vocabData = await vocabResponse.json();
        const sentenceData = await sentenceResponse.json();

        console.log('sentenceData.sentences', sentenceData.sentences)

        setVocabularies(vocabData.vocabulary || []);
        setSentences(sentenceData.sentences || []);
      } catch (error) {
        console.error("Error fetching saved items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchSavedItems();
    }
  }, [session?.accessToken]);

  // Show loading state while checking authentication
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render anything while redirecting to login
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