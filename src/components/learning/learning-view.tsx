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

interface LearningViewProps {
  session: LearningSessionType;
  videoId: string;
  onBack: () => void;
  language: string;
}

export function LearningView({ session, videoId, onBack, language }: LearningViewProps) {
  const { getProgress, updateProgress } = useLearningProgress();
  const sessionProgress = getProgress(session.id);

  const handleVocabularyProgress = (wordId: string, completed: boolean) => {
    updateProgress(session.id, 'vocabulary', wordId, completed);
  };

  const handleSentenceProgress = (sentenceId: string, completed: boolean) => {
    updateProgress(session.id, 'sentences', sentenceId, completed);
  };

  const handleExerciseComplete = (score: number) => {
    session.exercises.forEach((_, index) => {
      updateProgress(session.id, 'exercises', `exercise-${index}`, true);
    });
  };

  const handleComplete = () => {
    const shouldComplete = !isFullyCompleted; // Toggle completion state
    
    // Mark everything as completed or uncompleted
    session.vocabulary.forEach(word => {
      updateProgress(session.id, 'vocabulary', word.word, shouldComplete);
    });
    session.sentences.forEach(sentence => {
      updateProgress(session.id, 'sentences', sentence.original, shouldComplete);
    });
    session.exercises.forEach((_, index) => {
      updateProgress(session.id, 'exercises', `exercise-${index}`, shouldComplete);
    });
  };

  const isFullyCompleted = sessionProgress.overallProgress === 100;

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
        progress={sessionProgress.overallProgress}
        onComplete={handleComplete}
        onBookmark={() => {/* Handle bookmark */}}
        isBookmarked={false}
        isCompleted={isFullyCompleted}
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
            completedItems={sessionProgress.vocabulary}
            onToggleComplete={handleVocabularyProgress}
          />
        </TabPanel>

        <TabPanel value="sentences">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Key Sentences ({session.sentences.length})
            </h3>
            <SentencesList 
              sentences={session.sentences}
              language={language}
              completedItems={sessionProgress.sentences}
              onToggleComplete={handleSentenceProgress}
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
            />
          </div>
        </TabPanel>
      </LearningTabs>
    </motion.div>
  );
} 