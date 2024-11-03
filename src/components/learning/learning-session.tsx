"use client";

import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LearningSessionProps {
  session: LearningSessionType;
  onClose: () => void;
}

export function LearningSession({ session, onClose }: LearningSessionProps) {
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Introduction */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">{session.title}</h2>
            <p className="text-sm">{session.introduction.message}</p>
          </Card>

          {/* Summary */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Key Points</h3>
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