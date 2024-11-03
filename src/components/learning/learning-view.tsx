import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { LearningTabs, TabPanel } from "./learning-tabs";
import { LearningSession } from "./learning-session";
import { VocabularyList } from "./vocabulary-list";
import { SentencesList } from "./sentences-list";
import { Exercises } from "./exercises";
import { motion } from "framer-motion";
import { useLearningProgress } from "@/store/learning-progress";
import { Button } from "@/components/ui/button";
import { TutorMessage } from "./tutor-message";
import { useEffect, useState } from "react";

interface LearningViewProps {
  session: LearningSessionType;
  videoId: string;
  onBack: () => void;
  language: string;
}

export function LearningView({ session, videoId, onBack, language }: LearningViewProps) {
  const { toggleItemCompletion, initializeProgress, getProgress } = useLearningProgress();

  // Initialize progress when session is loaded
  useEffect(() => {
    if (session) {
      initializeProgress(session.id, session);
    }
  }, [session]);

  // Get total items count
  const totalItems = 
    session.vocabulary.length + 
    session.sentences.length + 
    session.exercises.length;

  // Get current progress directly from store
  const currentProgress = getProgress(session.id);
  const overallProgress = (currentProgress.completedItems.length / totalItems) * 100;

  const handleVocabularyProgress = (index: number) => {
    toggleItemCompletion(session.id, `word-${index}`);
  };

  const handleSentenceProgress = (index: number) => {
    toggleItemCompletion(session.id, `sentence-${index}`);
  };

  const handleExerciseComplete = (score: number) => {
    session.exercises.forEach((_, index) => {
      toggleItemCompletion(session.id, `exercise-${index}`);
    });
  };

  const handleCompleteAll = () => {
    // Mark all items as completed or uncompleted based on current state
    const shouldComplete = overallProgress < 100;
    
    session.vocabulary.forEach((_, index) => {
      const itemId = `word-${index}`;
      if (shouldComplete !== currentProgress.completedItems.includes(itemId)) {
        toggleItemCompletion(session.id, itemId);
      }
    });

    session.sentences.forEach((_, index) => {
      const itemId = `sentence-${index}`;
      if (shouldComplete !== currentProgress.completedItems.includes(itemId)) {
        toggleItemCompletion(session.id, itemId);
      }
    });

    session.exercises.forEach((_, index) => {
      const itemId = `exercise-${index}`;
      if (shouldComplete !== currentProgress.completedItems.includes(itemId)) {
        toggleItemCompletion(session.id, itemId);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-4 mx-16 mt-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Your Lesson
        </h1>
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back to Video
        </Button>
      </div>

      <TutorMessage 
        language={language}
        variant="lesson"
        message={session.introduction.message}
      />

      <LearningTabs 
        videoId={videoId}
        progress={overallProgress}
        onComplete={handleCompleteAll}
        onBookmark={() => {/* Handle bookmark */}}
        isBookmarked={false}
        isCompleted={overallProgress === 100}
      >
        <TabPanel value="summary">
          <LearningSession 
            session={session}
            onClose={onBack}
          />
        </TabPanel>
        
        <TabPanel value="vocabulary">
          <VocabularyList 
            words={session.vocabulary}
            language={language}
            onToggleComplete={handleVocabularyProgress}
            sessionId={session.id}
          />
        </TabPanel>

        <TabPanel value="sentences">
          <div className="space-y-6">
            <SentencesList 
              sentences={session.sentences}
              language={language}
              onToggleComplete={handleSentenceProgress}
              sessionId={session.id}
            />
          </div>
        </TabPanel>

        <TabPanel value="exercises">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Practice Exercises
            </h3>
            <Exercises
              exercises={session.exercises}
              language={language}
              onComplete={handleExerciseComplete}
              sessionId={session.id}
            />
          </div>
        </TabPanel>
      </LearningTabs>
    </motion.div>
  );
} 