"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useVideosStore } from "@/store/videos";
import { VideoPlayer } from "@/components/video-player";
import { VocabularyPanel } from "@/components/vocabulary/vocabulary-panel";
import { LearningSession } from "@/components/learning/learning-session";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguageSettings } from '@/hooks/useLanguageSettings';
import { generateLearningSession } from "@/services/vocabulary";
import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { useHighlightsStore } from "@/store/highlights";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

type LearningStep = 'selecting' | 'learning' | 'completed';

export default function VideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const startTime = searchParams.get('t');
  const { videos } = useVideosStore();
  const video = videos.find((v) => v.id === params.id);
  const { getHighlightsForVideo } = useHighlightsStore();
  
  const [transcriptData, setTranscriptData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [learningStep, setLearningStep] = useState<LearningStep>('selecting');
  const [isGenerating, setIsGenerating] = useState(false);

  const { getClassSettings } = useLanguageSettings();

  // complete learning session
  const [learningSession, setLearningSession] = useState<LearningSessionType | null>(null);

  const highlights = video ? getHighlightsForVideo(video.id) : [];

  const { data: userSession } = useSession();

  const handleGenerateLesson = async () => {
    if (!video || !transcriptData || !userSession || !userSession.accessToken) return;
    
    setIsGenerating(true);
    try {
      const session = await generateLearningSession({
        highlights,
        videoContext: {
          id: video.id,
          title: video.customTitle,
          language: video.language,
          transcript: transcriptData.transcription.data.map((s: any) => s.text).join(' '),
        },
        userLevel: getClassSettings(video.language)?.level || 'intermediate',
      }, userSession?.accessToken);
      setLearningSession(session);
      setLearningStep('learning');
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      toast({
        variant: "destructive",
        title: "Failed to generate lesson",
        description: "Please try again later",
      });
    } finally {
      setIsGenerating(false);
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

  const renderContent = () => {
    switch (learningStep) {
      case 'selecting':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Select Words & Sentences
              </h2>
              <Button
                onClick={handleGenerateLesson}
                disabled={isGenerating || highlights.length === 0}
              >
                Continue to Lesson
              </Button>
            </div>
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
          </motion.div>
        );

      case 'learning':
        return learningSession ? (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Learning Session
              </h2>
              <Button
                variant="outline"
                onClick={() => setLearningStep('selecting')}
              >
                Back to Video
              </Button>
            </div>
            <LearningSession 
              session={learningSession}
              onClose={() => setLearningStep('selecting')}
            />
          </motion.div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
      <div className="w-80 shrink-0 border-l">
        <VocabularyPanel 
          videoId={video.id}
          onGenerateSession={handleGenerateLesson}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
} 