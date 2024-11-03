import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2 } from "lucide-react";
import { VocabularyWord } from "@/types/vocabulary";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { cn } from "@/lib/utils";
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

  console.log('completedItems', completedItems);

  return (
    <div className="space-y-4">
      <audio ref={audioRef} hidden />
      {words.map((word) => {
        const isCompleted = completedItems[word.word]?.completed || false;
        const wordSentenceId = `word-${word.word}`.hashCode();

        return (
          <Card key={word.word} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{word.word}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6" 
                    onClick={() => playAudio(word.word, language, wordSentenceId)}
                    disabled={audioLoading}
                  >
                    <Volume2 className={cn(
                      "w-3 h-3 mr-1",
                      isPlaying && "text-primary animate-pulse"
                    )} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {word.translation}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{word.partOfSpeech}</Badge>
                <Button
                  variant={"outline"}
                  size="sm"
                  onClick={() => onToggleComplete(word.word, !isCompleted)}
                >
                  <CheckCircle className={cn(
                    "h-4 w-4 mr-1",
                    isCompleted && "text-green-500"
                  )} />
                  {isCompleted ? "Learned" : "Mark Learned"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {word.examples.map((example, i) => {
                const exampleSentenceId = `word-${word.word}-example-${i}`.hashCode();

                return (
                  <div key={i} className="text-sm pl-4 border-l-2">
                    <p>{example.sentence}</p>
                    <p className="text-muted-foreground">{example.translation}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-1"
                      onClick={() => playAudio(example.sentence, language, exampleSentenceId)}
                      disabled={audioLoading}
                    >
                      <Volume2 className={cn(
                        "h-3 w-3 mr-1",
                        isPlaying && "text-primary animate-pulse"
                      )} />
                      Play Audio
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
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