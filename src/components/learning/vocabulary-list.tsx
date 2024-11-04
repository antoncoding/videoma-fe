import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2, BookmarkIcon } from "lucide-react";
import { VocabularyWord } from "@/types/vocabulary";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearningProgress } from "@/store/learning-progress";
import { useSentenceManager } from "@/hooks/useSentenceManager";
import { useSession } from "next-auth/react";

interface VocabularyListProps {
  words: VocabularyWord[];
  language: string;
  onToggleComplete: (index: number) => void;
  sessionId: string;
  videoId: string;
}

export function VocabularyList({ 
  words, 
  language, 
  onToggleComplete,
  sessionId,
  videoId,
}: VocabularyListProps) {
  const { audioRef, isPlaying, audioLoading, playAudio } = useAudioPlayback();
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());
  const { isItemCompleted } = useLearningProgress();
  const { saveVocabulary, deleteVocabulary } = useSentenceManager();
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set());
  const { data: session } = useSession();
  const [savedVocabs, setSavedVocabs] = useState<Record<string, number>>({});

  // Fetch saved status on mount
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!session?.accessToken) return;
      
      try {
        const response = await fetch("http://localhost:5000/api/vocabulary", {
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
          },
        });
        
        if (!response.ok) return;
         
        const data = await response.json();
        // Create a mapping of word -> id for saved vocabularies
        const savedMap = (data.vocabulary || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.word] = item.id;
          return acc;
        }, {});
        setSavedVocabs(savedMap);
      } catch (error) {
        console.error("Failed to fetch saved status:", error);
      }
    };

    fetchSavedStatus();
  }, [session?.accessToken]);

  const handleBookmark = async (word: VocabularyWord) => {
    if (!session?.accessToken) return;

    if (savedVocabs[word.word]) {
      // If already saved, delete it
      const success = await deleteVocabulary(savedVocabs[word.word]);
      if (success) {
        setSavedVocabs(prev => {
          const newMap = { ...prev };
          delete newMap[word.word];
          return newMap;
        });
      }
    } else {
      // If not saved, save it
      const success = await saveVocabulary(videoId, word);
      if (success) {
        // Refetch to get the new ID
        const response = await fetch("http://localhost:5000/api/vocabulary", {
          headers: {
            "Authorization": `Bearer ${session?.accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const newItem = data.vocabulary.find((v: any) => v.word === word.word);
          if (newItem) {
            setSavedVocabs(prev => ({
              ...prev,
              [word.word]: newItem.id
            }));
          }
        }
      }
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleToggleComplete = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    onToggleComplete(idx);
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} hidden />
      {words.map((word, index) => {
        const itemId = `word-${index}`;
        const isCompleted = isItemCompleted(sessionId, itemId);
        const wordSentenceId = itemId.hashCode();
        
        // need a more complex id to make sure it's unique, don't mess up with cache
        const audioId = `${itemId}-${word.word}`.hashCode();
        const isExpanded = expandedWords.has(itemId);
        const isBookmarked = bookmarkedWords.has(word.word);

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
              onClick={() => toggleExpanded(itemId)}
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
                          playAudio(word.word, language, audioId);
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
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(word);
                      }}
                    >
                      <BookmarkIcon className={cn(
                        "h-4 w-4",
                        word.word in savedVocabs && "fill-current"
                      )} />
                    </Button>
                    <Button
                      variant={"outline"}
                      size="sm"
                      className="w-[120px]"
                      onClick={(e) => handleToggleComplete(index, e)}
                    >
                      <CheckCircle className={cn(
                        "h-4 w-4 mr-1",
                        isCompleted && "text-green-500"
                      )} />
                      {isCompleted ? "Learned" : "Mark Learned"}
                    </Button>
                  </div>
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