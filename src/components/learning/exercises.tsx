import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LearningSession } from '@/types/vocabulary';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, ArrowRight, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { Badge } from '@/components/ui/badge';

type Exercise = LearningSession['exercises'][0];
import { ExerciseType } from '@/types/vocabulary';
import { useLearningProgress } from '@/store/learning-progress';

interface ExercisesProps {
  exercises: Exercise[];
  onComplete: (score: number) => void;
  language: string;
  sessionId: string;
}

export function Exercises({ exercises, onComplete, language, sessionId }: ExercisesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const { audioRef, isPlaying, audioLoading, playAudio } = useAudioPlayback();
  const { isItemCompleted, toggleItemCompletion } = useLearningProgress();

  const exercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;
  const exerciseId = `exercise-${currentIndex}`.hashCode();

  console.log('exercises', exercises);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer.toLowerCase() === exercise.answer.toLowerCase();
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastExercise) {
      toggleItemCompletion(sessionId, `exercise-${currentIndex}`);
      onComplete(score);
    } else {
      toggleItemCompletion(sessionId, `exercise-${currentIndex}`);
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setUserInput('');
    }
  };

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case ExerciseType.MultipleChoice:
        return (
          <div className="space-y-6">
            {/* Question Section */}
            <div className="space-y-2">
              <h4 className="text-lg font-medium">Question</h4>
              <p className="text-muted-foreground">{exercise.question}</p>
            </div>

            {/* Options Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Choose your answer:</h4>
              <div className="grid grid-cols-1 gap-3">
                {exercise.options?.map((option, index) => {
                  const isSelected = selectedAnswer === option;

                  // exact match, or the index corresponding to A, B, C, D
                  const isCorrect = option.toLowerCase() === exercise.answer.toLowerCase() ||
                    (exercise.answer.toLowerCase() === String.fromCharCode(65 + index).toLowerCase());
                  
                  const showResult = selectedAnswer !== null;

                  return (
                    <Button
                      key={option}
                      variant={showResult 
                        ? isCorrect 
                          ? "default"
                          : isSelected 
                            ? "destructive"
                            : "outline"
                        : isSelected 
                          ? "default"
                          : "outline"
                      }
                      onClick={() => !selectedAnswer && handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className="relative w-full justify-start h-auto py-3 px-4"
                    >
                      <span className="mr-2">{String.fromCharCode(65 + exercise.options!.indexOf(option))}.</span>
                      {option}
                      {showResult && isCorrect && (
                        <CheckCircle className="absolute right-3 h-4 w-4 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="absolute right-3 h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case ExerciseType.TrueFalse:
        return (
          <div className="space-y-6">
            {/* Question Section */}
            <div className="space-y-2">
              <h4 className="text-lg font-medium">Question</h4>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">{exercise.question}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playAudio(exercise.question, language, exerciseId)}
                  disabled={audioLoading}
                >
                  <Volume2 className={cn(
                    "h-4 w-4",
                    isPlaying && "text-primary animate-pulse"
                  )} />
                </Button>
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Choose your answer:</h4>
              <div className="grid grid-cols-1 gap-3">
                {['True', 'False'].map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option.toLowerCase() === exercise.answer.toLowerCase();
                  const showResult = selectedAnswer !== null;

                  return (
                    <Button
                      key={option}
                      variant={showResult 
                        ? isCorrect 
                          ? "default"
                          : isSelected 
                            ? "destructive"
                            : "outline"
                      : isSelected 
                        ? "default"
                        : "outline"
                    }
                    onClick={() => !selectedAnswer && handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className="relative w-full justify-start h-auto py-3 px-4"
                  >
                    <span className="mr-2">{option === 'True' ? 'A' : 'B'}.</span>
                    {option}
                    {showResult && isCorrect && (
                      <CheckCircle className="absolute right-3 h-4 w-4 text-green-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="absolute right-3 h-4 w-4 text-red-500" />
                    )}
                  </Button>
                );
              })}
              </div>
            </div>
          </div>
        );

      case ExerciseType.FillInBlank:

        console.log('exercise fill', exercise)

        return (
          <div className="space-y-6">
            {/* Question Section */}
            <div className="space-y-2">
              <h4 className="text-lg font-medium">Question</h4>
              <p className="text-muted-foreground">{exercise.question}</p>
            </div>

            {/* Answer Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Answer:</h4>
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={selectedAnswer !== null}
                  className="max-w-[300px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !selectedAnswer && userInput) {
                      handleAnswer(userInput);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAnswer(userInput)}
                  disabled={selectedAnswer !== null || !userInput}
                >
                  Check Answer
                </Button>
              </div>

              {selectedAnswer && (
                <div className={cn(
                  "p-4 rounded-md mt-4",
                  selectedAnswer.toLowerCase() === exercise.answer.toLowerCase()
                    ? "bg-green-500/10"
                    : "bg-red-500/10"
                )}>
                  <div className="flex items-center gap-2">
                    {selectedAnswer.toLowerCase() === exercise.answer.toLowerCase() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <p className="font-medium">
                      {selectedAnswer.toLowerCase() === exercise.answer.toLowerCase()
                        ? "Correct!"
                        : "Not quite right"}
                    </p>
                  </div>
                  <p className="mt-2">Correct answer: {exercise.answer}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCurrentExerciseCompleted = isItemCompleted(sessionId, `exercise-${currentIndex}`);

  return (
    <Card className={cn(
      "p-6",
      isCurrentExerciseCompleted && "border-green-500/20 bg-green-50/50"
    )}>
      <audio ref={audioRef} hidden />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Exercise {currentIndex + 1}/{exercises.length}</h3>
            <p className="text-sm text-muted-foreground">
              {exercise.type === ExerciseType.MultipleChoice ? 'Choose the correct answer' :
               exercise.type === ExerciseType.TrueFalse ? 'True or False' :
               'Fill in the blank'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Score: {score}/{exercises.length}
            </Badge>
            {selectedAnswer && (
              <Button 
                onClick={handleNext}
                className={cn(
                  isCurrentExerciseCompleted && "text-green-500"
                )}
              >
                {isLastExercise ? 'Complete' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderExerciseContent()}
          </motion.div>
        </AnimatePresence>

        {selectedAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-muted rounded-md"
          >
            <h4 className="font-medium">Explanation</h4>
            <p className="text-sm mt-2">{exercise.explanation}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
} 