import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { LearningTabs, TabPanel } from "./learning-tabs";
import { LearningSession } from "./learning-session";
import { VocabularyList } from "./vocabulary-list";
import { SentencesList } from "./sentences-list";
import { Exercises } from "./exercises";
import { motion } from "framer-motion";

interface LearningViewProps {
  session: LearningSessionType;
  videoId: string;
  onBack: () => void;
  language: string;
}

export function LearningView({ session, videoId, onBack, language }: LearningViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-4"
    >
      <LearningTabs videoId={videoId}>
        <TabPanel value="summary">
          <LearningSession 
            session={session}
            onClose={onBack}
          />
        </TabPanel>
        
        <TabPanel value="vocabulary">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Vocabulary ({session.vocabulary.length} words)
            </h3>
            <VocabularyList 
              words={session.vocabulary}
              onProgress={(progress: number) => {
                // Update progress
              }}
              language={language}
            />
          </div>
        </TabPanel>

        <TabPanel value="sentences">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Key Sentences ({session.sentences.length})
            </h3>
            <SentencesList 
              sentences={session.sentences}
              language={language}
              onProgress={(progress: number) => {
                // Update progress
              }}
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
              onComplete={(score: number) => {
                // Handle exercise completion
              }}
            />
          </div>
        </TabPanel>
      </LearningTabs>
    </motion.div>
  );
} 