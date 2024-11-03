import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { VocabularyWord } from "@/types/vocabulary";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressItem } from "@/store/learning-progress";

interface VocabularyListProps {
  words: VocabularyWord[];
  language: string;
  completedItems: Record<string, ProgressItem>;
  onToggleComplete: (wordId: string, completed: boolean) => void;
}

export function VocabularyList({ 
  words, 
  language, 
  completedItems,
  onToggleComplete 
}: VocabularyListProps) {
  const { audioRef, isPlaying, audioLoading, playAudio } = useAudioPlayback();
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());

  const toggleExpanded = (wordId: string) => {
    const newExpanded = new Set(expandedWords);
    if (newExpanded.has(wordId)) {
      newExpanded.delete(wordId);
    } else {
      newExpanded.add(wordId);
    }
    setExpandedWords(newExpanded);
  };

  const handleToggleComplete = (wordId: string, completed: boolean) => {
    onToggleComplete(wordId, completed);
    // Automatically expand when unchecking, collapse when checking
    if (!completed) {
      setExpandedWords(prev => new Set(prev).add(wordId));
    } else {
      setExpandedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} hidden />
      {words.map((word) => {
        const isCompleted = completedItems[word.word]?.completed || false;
        const wordSentenceId = `word-${word.word}`.hashCode();
        const isExpanded = expandedWords.has(word.word);

        return (
          <motion.div
            key={word.word}
            layout
            transition={{ duration: 0.2 }}
          >
            <Card 
              className={cn(
                "p-4",
                isCompleted && "border-green-500/20 bg-green-50/50",
                "cursor-pointer"
              )}
              onClick={() => toggleExpanded(word.word)}
            >
              <div className="space-y-4">
                {/* Main word section */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-lg">{word.word}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6" 
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(word.word, language, wordSentenceId);
                        }}
                        disabled={audioLoading}
                      >
                        <Volume2 className={cn(
                          "w-3 h-3",
                          isPlaying && "text-primary animate-pulse"
                        )} />
                      </Button>
                      <Badge variant="secondary">{word.partOfSpeech}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {word.translation}
                    </p>
                  </div>
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(word.word, !isCompleted);
                    }}
                  >
                    <CheckCircle className={cn(
                      "h-4 w-4 mr-1",
                      isCompleted && "text-green-500"
                    )} />
                    {isCompleted ? "Learned" : "Mark Learned"}
                  </Button>
                </div>

                {/* Expandable content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-6 pt-4 border-t">
                        {/* Examples section */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Examples</h4>
                          {word.examples.map((example, i) => {
                            const exampleSentenceId = `word-${word.word}-example-${i}`.hashCode();
                            return (
                              <div key={i} className="text-sm pl-4 border-l-2">
                                <div className="flex items-center gap-2">
                                  <p>{example.sentence}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playAudio(example.sentence, language, exampleSentenceId);
                                    }}
                                    disabled={audioLoading}
                                  >
                                    <Volume2 className={cn(
                                      "h-3 w-3",
                                      isPlaying && "text-primary animate-pulse"
                                    )} />
                                  </Button>
                                </div>
                                <p className="text-muted-foreground">{example.translation}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};