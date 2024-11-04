import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2 } from "lucide-react";
import { SentenceAnalysis } from "@/types/vocabulary";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearningProgress } from "@/store/learning-progress";

interface SentencesListProps {
  sentences: SentenceAnalysis[];
  language: string;
  onToggleComplete: (index: number) => void;
  sessionId: string;
}

export function SentencesList({ 
  sentences, 
  language,
  onToggleComplete,
  sessionId,
}: SentencesListProps) {
  const { audioRef, isPlaying, audioLoading, playAudio } = useAudioPlayback();
  const [expandedSentences, setExpandedSentences] = useState<Set<string>>(new Set());
  const { isItemCompleted } = useLearningProgress();

  const toggleExpanded = (sentenceId: string) => {
    const newExpanded = new Set(expandedSentences);
    if (newExpanded.has(sentenceId)) {
      newExpanded.delete(sentenceId);
    } else {
      newExpanded.add(sentenceId);
    }
    setExpandedSentences(newExpanded);
  };

  const handleToggleComplete = (idx: number, completed: boolean) => {
    onToggleComplete(idx);
    // Automatically expand when unchecking, collapse when checking
    if (!completed) {
      setExpandedSentences(prev => new Set(prev).add(`sentence-${idx}`));
    } else {
      setExpandedSentences(prev => {
        const newSet = new Set(prev);
        newSet.delete(`sentence-${idx}`);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} hidden />
      {sentences.map((sentence, index) => {
        const itemId = `sentence-${index}`;
        const isCompleted = isItemCompleted(sessionId, itemId);
        const mainSentenceId = itemId.hashCode();
        const isExpanded = expandedSentences.has(itemId);

        const audioId = `${itemId}-${sentence.original}`.hashCode();
        
        return (
          <motion.div
            key={index}
            layout
            transition={{ duration: 0.2 }}
          >
            <Card 
              className={cn(
                "p-4",
                isCompleted && "border-green-500/20 bg-green-50/50",
                "cursor-pointer"
              )}
              onClick={() => toggleExpanded(itemId)}
            >
              <div className="space-y-4">
                {/* Main sentence section */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{sentence.original}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(sentence.original, language, audioId);
                        }}
                        disabled={audioLoading}
                      >
                        <Volume2 className={cn(
                          "h-4 w-4",
                          isPlaying && "text-primary animate-pulse"
                        )} />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{sentence.translation}</p>
                  </div>
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(index, !isCompleted);
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
                        {/* Breakdown section */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Word Breakdown</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {sentence.breakdown.map((part, i) => {
                              const partId = `sentence-${sentence.original}-part-${i}`.hashCode();
                              return (
                                <div key={i} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{part.word}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playAudio(part.word, language, partId);
                                      }}
                                      disabled={audioLoading}
                                    >
                                      <Volume2 className={cn(
                                        "h-3 w-3",
                                        isPlaying && "text-primary animate-pulse"
                                      )} />
                                    </Button>
                                  </div>
                                  <span className="text-muted-foreground"> - {part.translation}</span>
                                  {part.explanation && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {part.explanation}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Grammar section */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Grammar</h4>
                          <Badge variant="secondary">{sentence.grammar.tense}</Badge>
                          <p className="text-sm">{sentence.grammar.explanation}</p>
                        </div>

                        {/* Similar Examples section */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Similar Examples</h4>
                          {sentence.similarExamples.map((example, i) => {
                            const exampleId = `sentence-${sentence.original}-example-${i}`.hashCode();
                            return (
                              <div key={i} className="text-sm pl-4 border-l-2">
                                <div className="flex items-center gap-2">
                                  <p>{example.sentence}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playAudio(example.sentence, language, exampleId);
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

                        {/* Context section */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Context</h4>
                          <p className="text-sm">{sentence.context.explanation}</p>
                          <p className="text-sm text-muted-foreground">{sentence.context.usage}</p>
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