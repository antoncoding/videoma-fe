"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSentenceManager } from "@/hooks/useSentenceManager";
import { Trash2, ExternalLink, Star, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

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

  const getLanguageEmoji = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'es': return '🇪🇸';
      case 'en': return '🇬🇧';
      default: return '🌐';
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
          <Card key={sentence.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Video info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(sentence.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{sentence.video_title}</span>
                </div>
              </div>

              {/* Original text */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getLanguageEmoji(sentence.original_language)}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(
                    `${sentence.video_url}?t=${Math.floor(sentence.timestamp)}`,
                    '_blank'
                  )}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch
                </Button>
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
        ))}
      </div>
    </div>
  );
} 