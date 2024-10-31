"use client";

import { useParams } from "next/navigation";
import { useVideosStore } from "@/store/videos";
import { VideoPlayer } from "@/components/video-player";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface TranscriptResponse {
  status: string;
  transcription: {
    source: string;
    data: Array<{ text: string; start: number; duration: number }>;
  };
  translation?: {
    source: string;
    data: Array<{ text: string; start: number; duration: number }>;
  };
}

export default function VideoPage() {
  const params = useParams();
  const { videos, updateVideoTitle } = useVideosStore();
  const video = videos.find((v) => v.id === params.id);
  
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (video?.customTitle) {
      setNewTitle(video.customTitle);
    }
  }, [video]);

  useEffect(() => {
    if (!video) return;

    const fetchTranscript = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_url: video.url,
            audio_language: video.language,
            target_language: "en",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTranscriptData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load video");
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchTranscript();
  }, [video]);

  const handleTitleUpdate = () => {
    if (video && newTitle.trim()) {
      updateVideoTitle(video.id, newTitle.trim());
      setIsEditing(false);
    }
  };

  if (!video) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Video not found</h2>
          <p className="text-muted-foreground">
            This video might have been removed or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isInitialLoad) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 w-48 bg-muted rounded" />
        <div className="aspect-video bg-muted rounded-lg" />
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!transcriptData) {
    return <div>No transcript data available</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-2xl font-bold"
              autoFocus
              placeholder="Enter video title"
            />
            <Button
              onClick={handleTitleUpdate}
              disabled={!newTitle.trim()}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={() => {
              setIsEditing(false);
              setNewTitle(video?.customTitle || "");
            }}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{video.customTitle}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {transcriptData?.status === "success" && (
        <VideoPlayer
          videoId={video.id}
          videoUrl={video.url}
          transcript={transcriptData.transcription}
          translation={transcriptData.translation}
          audioLanguage={video.language}
          targetLanguage="en"
        />
      )}
    </div>
  );
} 