"use client";

import { useParams } from "next/navigation";
import { useVideosStore } from "@/store/videos";
import { VideoPlayer } from "@/components/video-player";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { videos } = useVideosStore();
  const video = videos.find((v) => v.id === params.id);
  
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
            target_language: "en", // You might want to make this configurable
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
      }
    };

    fetchTranscript();
  }, [video]);

  if (!video) {
    return <div>Video not found</div>;
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
      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
      <VideoPlayer
        videoUrl={video.url}
        transcript={transcriptData.transcription}
        translation={transcriptData.translation}
        audioLanguage={video.language}
        targetLanguage="en"
      />
    </div>
  );
} 