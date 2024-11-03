"use client";

import { LearningSession as LearningSessionType } from "@/types/vocabulary";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LearningSessionProps {
  session: LearningSessionType;
  onClose: () => void;
}

export function LearningSession({ session }: LearningSessionProps) {
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Summary */}
          <Card className="p-4 space-y-4 p-8">
          <h2 className="text-lg font-semibold mb-4">{session.title}</h2>
            <ul className="list-disc pl-4 space-y-2">
              {session.summary.keyPoints.map((point, idx) => (
                <li key={idx} className="text-sm">{point}</li>
              ))}
            </ul>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
} 