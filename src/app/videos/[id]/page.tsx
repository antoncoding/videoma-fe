"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useVideosStore } from "@/store/videos";
import { VideoPlayer } from "@/components/video-player";
import { VocabularyPanel } from "@/components/vocabulary/vocabulary-panel";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguageSettings } from '@/hooks/useLanguageSettings';
import { TranscriptData } from "@/types/subtitle";
import { generateLearningSession } from "@/services/vocabulary";
import { LearningSession } from "@/types/vocabulary";
import { useHighlightsStore } from "@/store/highlights";
import { AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/contexts/sidebar-context";

interface VideoTranscriptResponse {
  status: string;
  transcription: TranscriptData;
  translation?: TranscriptData;
}

export default function VideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const startTime = searchParams.get('t');
  const { videos } = useVideosStore();
  const { getAssistingLanguage } = useLanguageSettings();
  const video = videos.find((v) => v.id === params.id);
  
  const [transcriptData, setTranscriptData] = useState<VideoTranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [learningSession, setLearningSession] = useState<LearningSession | null>(null);

  const { data: userSession } = useSession();

  const { getClassSettings } = useLanguageSettings();

  const { showRightSidebar } = useSidebar();

  const handleGenerateLesson = async () => {
    if (!video || !userSession || !userSession.accessToken) return;

    const classSettings = getClassSettings(video.language);
    
    setIsGeneratingLesson(true);
    try {
      const highlights = useHighlightsStore.getState().getHighlightsForVideo(video.id);
      const session = await generateLearningSession({
        highlights,
        videoContext: {
          id: video.id,
          title: video.customTitle,
          language: video.language,
          transcript: transcriptData?.transcription.data.map(s => s.text).join(' ') || '',
        },
        userLevel: classSettings?.level || 'beginner',
      }, userSession?.accessToken);
      setLearningSession(session);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  useEffect(() => {
    if (!video) return;

    const fetchTranscript = async () => {
      try {
        const assistingLanguage = getAssistingLanguage(video.language);

        const response = await fetch("http://localhost:5000/api/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_url: video.url,
            audio_language: video.language,
            target_language: assistingLanguage,
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

  // Show vocabulary panel in right sidebar on mount
  useEffect(() => {
    showRightSidebar(
      <VocabularyPanel 
        videoId={video?.id || ''}
        onGenerateSession={handleGenerateLesson}
      />
    );
  }, [video?.id]);

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

  return (
    <div className="max-w-[1200px] mx-auto items-center">
      <VideoPlayer
        videoId={video.id}
        videoUrl={video.url}
        transcript={transcriptData?.transcription}
        translation={transcriptData?.translation}
        audioLanguage={video.language}
        isLoading={loading}
        initialTime={startTime ? parseInt(startTime) : 0}
        error={error}
      />
    </div>
  );
} 