import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LearningSession } from '@/types/vocabulary';

type Exercise = LearningSession['exercises'][0];

interface ExercisesProps {
  exercises: Exercise[];
  onComplete: (score: number) => void;
}

export function Exercises({ exercises, onComplete }: ExercisesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === exercises[currentIndex].answer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        onComplete(score);
      }
    }, 1000);
  };

  const exercise = exercises[currentIndex];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Exercise {currentIndex + 1}/{exercises.length}</h3>
          <span className="text-sm text-muted-foreground">Score: {score}</span>
        </div>
        
        <p className="text-lg">{exercise.question}</p>

        {exercise.type === 'multiple-choice' && exercise.options && (
          <div className="grid grid-cols-2 gap-4">
            {exercise.options.map((option) => (
              <Button
                key={option}
                variant={selectedAnswer === option 
                  ? option === exercise.answer 
                    ? "default"
                    : "destructive"
                  : "outline"
                }
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {exercise.type === 'translation' && (
          <div className="space-y-4">
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Type your translation here..."
              disabled={selectedAnswer !== null}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnswer((e.target as HTMLTextAreaElement).value);
                }
              }}
            />
            <Button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) handleAnswer(textarea.value);
              }}
              disabled={selectedAnswer !== null}
            >
              Submit
            </Button>
          </div>
        )}

        {selectedAnswer && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium">Explanation</h4>
            <p className="text-sm mt-2">{exercise.explanation}</p>
          </div>
        )}
      </div>
    </Card>
  );
} 