"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useVideosStore } from "@/store/videos";
import { VideoPlayer } from "@/components/video-player";
import { VocabularyPanel } from "@/components/vocabulary/vocabulary-panel";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguageSettings } from '@/hooks/useLanguageSettings';
import { generateLearningSession } from "@/services/vocabulary";
import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { useHighlightsStore } from "@/store/highlights";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useVideoTranscript } from '@/hooks/useVideoTranscript';
import { useSidebar } from "@/contexts/sidebar-context";
import { VOICE_PROFILES } from '@/constants/voices';
import { LearningView } from "@/components/learning/learning-view";
import { TutorMessage } from "@/components/learning/tutor-message";

type LearningStep = 'selecting' | 'learning' | 'completed';

export default function VideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const startTime = searchParams.get('t');
  const { videos } = useVideosStore();
  const video = videos.find((v) => v.id === params.id);

  console.log('video', video);

  const { getHighlightsForVideo } = useHighlightsStore();
  const { showRightSidebar, hideRightSidebar } = useSidebar();
  
  const [learningStep, setLearningStep] = useState<LearningStep>('selecting');
  const [isGenerating, setIsGenerating] = useState(false);
  const { getClassSettings } = useLanguageSettings();
  const [learningSession, setLearningSession] = useState<LearningSessionType | null>(null);
  const highlights = video ? getHighlightsForVideo(video.id) : [];
  const { data: userSession } = useSession();

  const { transcript, translation, error, loading } = useVideoTranscript(
    video?.url || '',
    video?.language || 'es',
    getClassSettings(video?.language || 'es')?.assistingLanguage || 'en'
  );

  const { getVoiceSettings } = useLanguageSettings();

  const handleGenerateLesson = async () => {
    if (!video || !transcript || !userSession?.accessToken) return;
    
    const voiceSettings = getVoiceSettings(video.language);
    const voiceProfile = VOICE_PROFILES[video.language]?.find(
      v => v.id === voiceSettings?.voiceId
    );
    
    setIsGenerating(true);
    try {
      const response = await generateLearningSession({
        nonce: video.id,
        highlights,
        videoContext: {
          id: video.id,
          title: video.customTitle,
          language: video.language,
          transcript: transcript.data.map((s: any) => s.text).join(' '),
        },
        userLevel: getClassSettings(video.language)?.level || 'intermediate',
        tone: voiceProfile?.personality || 'A friendly and helpful teacher',
      }, userSession.accessToken);
      setLearningSession(response.generation.data);
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

  // Show vocabulary panel in right sidebar
  useEffect(() => {
    if (video) {
      showRightSidebar(
        <VocabularyPanel 
          videoId={video.id}
          onGenerateSession={handleGenerateLesson}
          isGenerating={isGenerating}
        />
      );
    }
    return () => hideRightSidebar();
  }, [video?.id, isGenerating]); // Minimal dependencies

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
    <div className="flex min-h-screen">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {learningStep === 'selecting' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mx-16 mt-8"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                  Watch Video
                </h1>
                <Button
                  onClick={handleGenerateLesson}
                  disabled={isGenerating || highlights.length === 0}
                >
                  Continue to Lesson
                </Button>
              </div>
              <TutorMessage 
                language={video.language} 
                message={ isGenerating ?
                  `Got it! I'm generating your custom lesson... This might take a few minutes.` :
                  `Hi! I'm your language tutor. Watch the video and click on any words or sentences you'd like to learn. I'll help you understand them better!`}
              />
              <VideoPlayer
                videoId={video.id}
                videoUrl={video.url}
                transcript={transcript}
                translation={translation}
                audioLanguage={video.language}
                isLoading={loading}
                initialTime={startTime ? parseInt(startTime) : 0}
                error={error}
              />
            </motion.div>
          ) : learningStep === 'learning' && learningSession ? (
            <LearningView
              session={learningSession}
              videoId={video.id}
              onBack={() => setLearningStep('selecting')}
              language={video.language}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
} 