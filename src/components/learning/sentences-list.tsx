import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2, Brain } from "lucide-react";
import { useState } from "react";
import { SentenceAnalysis } from "@/types/vocabulary";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { cn } from "@/lib/utils";

interface SentencesListProps {
  sentences: SentenceAnalysis[];
  onProgress: (progress: number) => void;
  language: string;
}

export function SentencesList({ sentences, onProgress, language }: SentencesListProps) {
  const [learnedSentences, setLearnedSentences] = useState<Set<number>>(new Set());
  const { audioRef, isPlaying, audioLoading, playAudio } = useAudioPlayback();

  const toggleLearned = (index: number) => {
    const newLearned = new Set(learnedSentences);
    if (newLearned.has(index)) {
      newLearned.delete(index);
    } else {
      newLearned.add(index);
    }
    setLearnedSentences(newLearned);
    onProgress((newLearned.size / sentences.length) * 100);
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} hidden />
      {sentences.map((sentence, idx) => {
        // Create unique IDs for main sentence and examples
        const mainSentenceId = `sentence-${idx}`.hashCode();
        
        return (
          <Card key={idx} className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{sentence.original}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => playAudio(sentence.original, language, mainSentenceId)}
                    disabled={audioLoading}
                  >
                    <Volume2 className={cn(
                      "h-4 w-4",
                      isPlaying && "text-primary animate-pulse"
                    )} />
                  </Button>
                </div>
                <p className="text-muted-foreground">{sentence.translation}</p>
              </div>
              <Button
                variant={learnedSentences.has(idx) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLearned(idx)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {learnedSentences.has(idx) ? "Learned" : "Mark Learned"}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Breakdown</h4>
              <div className="grid grid-cols-2 gap-2">
                {sentence.breakdown.map((part, i) => {
                  const partId = `sentence-${idx}-part-${i}`.hashCode();
                  
                  return (
                    <div key={i} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{part.word}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => playAudio(part.word, language, partId)}
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

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Grammar</h4>
              <Badge variant="secondary">{sentence.grammar.tense}</Badge>
              <p className="text-sm">{sentence.grammar.explanation}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Similar Examples</h4>
              {sentence.similarExamples.map((example, i) => {
                const exampleId = `sentence-${idx}-example-${i}`.hashCode();
                
                return (
                  <div key={i} className="text-sm pl-4 border-l-2">
                    <div className="flex items-center gap-2">
                      <p>{example.sentence}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => playAudio(example.sentence, language, exampleId)}
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

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Context</h4>
              <p className="text-sm">{sentence.context.explanation}</p>
              <p className="text-sm text-muted-foreground">{sentence.context.usage}</p>
            </div>
          </Card>
        )
      })}
    </div>
  );
} 