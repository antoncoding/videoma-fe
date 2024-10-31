"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
}

export default function SavedPage() {
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
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch("http://localhost:5000/api/sentences", {
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          signIn("google");
          return;
        }
        throw new Error('Failed to fetch sentences');
      }

      const data = await response.json();
      setSentences(data);
    } catch (error) {
      console.error("Error fetching saved sentences:", error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/sentences/${id}`, {
        method: "DELETE",
      });
      setSentences(sentences.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting sentence:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-montserrat mb-8">Saved Sentences</h1>
      <div className="space-y-4">
        {sentences.map((sentence) => (
          <Card key={sentence.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  From: {sentence.video_title}
                </p>
                <p className="mb-2">{sentence.original_text}</p>
                {sentence.translated_text && (
                  <p className="text-primary">{sentence.translated_text}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(
                    `${sentence.video_url}?t=${Math.floor(sentence.timestamp)}`,
                    '_blank'
                  )}
                >
                  Watch
                </Button>
                <Button
                  onClick={() => handleDelete(sentence.id)}
                >
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