"use client";

import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Volume2, ChevronRight, Book, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningSessionProps {
  session: LearningSessionType;
  onClose: () => void;
}

export function LearningSession({ session, onClose }: LearningSessionProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{session.title}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Introduction */}
          <Card className="p-4">
            <p className="text-sm">{session.introduction.message}</p>
          </Card>

          {/* Vocabulary Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Book className="w-4 h-4" />
              Vocabulary
            </h3>
            <div className="grid gap-4">
              {session.vocabulary.map((word, idx) => (
                <Card key={idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{word.word}</h4>
                      <p className="text-sm text-muted-foreground">
                        {word.translation}
                      </p>
                    </div>
                    <Badge variant="secondary">{word.partOfSpeech}</Badge>
                  </div>
                  <div className="text-sm">
                    <Button variant="ghost" size="sm" className="h-6">
                      <Volume2 className="w-3 h-3 mr-1" />
                      {word.pronunciation}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {word.examples.map((example, i) => (
                      <div key={i} className="text-sm pl-4 border-l-2">
                        <p>{example.sentence}</p>
                        <p className="text-muted-foreground">{example.translation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sentences Analysis */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Sentence Analysis
            </h3>
            <div className="grid gap-4">
              {session.sentences.map((sentence, idx) => (
                <Card key={idx} className="p-4 space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium">{sentence.original}</p>
                    <p className="text-muted-foreground">{sentence.translation}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sentence.breakdown.map((part, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{part.word}</span>
                          <span className="text-muted-foreground"> - {part.translation}</span>
                          {part.explanation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {part.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Grammar</h4>
                    <Badge variant="secondary">{sentence.grammar.tense}</Badge>
                    <p className="text-sm">{sentence.grammar.explanation}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Similar Examples</h4>
                    {sentence.similarExamples.map((example, i) => (
                      <div key={i} className="text-sm pl-4 border-l-2">
                        <p>{example.sentence}</p>
                        <p className="text-muted-foreground">{example.translation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Context</h4>
                    <p className="text-sm">{sentence.context.explanation}</p>
                    <p className="text-sm text-muted-foreground">{sentence.context.usage}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Summary</h3>
            <ul className="list-disc pl-4 space-y-2">
              {session.summary.keyPoints.map((point, idx) => (
                <li key={idx} className="text-sm">{point}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              {session.summary.nextSteps}
            </p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
} 