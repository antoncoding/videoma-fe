"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSentenceManager } from "@/hooks/useSentenceManager";
import { SentenceCard } from "@/components/saved/sentence-card";

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

export default function SavedPage() {
  const [sentences, setSentences] = useState<SavedSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { handleDeleteSentence } = useSentenceManager();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchSentences();
    }
  }, [session?.accessToken]);

  const fetchSentences = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sentences", {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          signIn("google");
          return;
        }
        throw new Error('Failed to fetch sentences');
      }

      const data = await response.json();
      setSentences(data);
    } catch (error) {
      console.error("Error fetching saved sentences:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: number) => {
    const success = await handleDeleteSentence(id);
    if (success) {
      setSentences(sentences.filter(s => s.id !== id));
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
      <h1 className="text-2xl font-montserrat mb-8">Saved Sentences</h1>
      <div className="space-y-6">
        {sentences.map((sentence) => (
          <SentenceCard 
            key={sentence.id}
            sentence={sentence}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
} 