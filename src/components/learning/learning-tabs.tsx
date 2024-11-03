import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, CheckCircleIcon, StarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LearningProgress {
  completed: boolean;
  bookmarked: boolean;
  progress: number;
}

interface LearningTabsProps {
  videoId: string;
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
}

export function LearningTabs({ videoId, children, onTabChange }: LearningTabsProps) {
  const [progress, setProgress] = useState<LearningProgress>(() => {
    const saved = localStorage.getItem(`learning-progress-${videoId}`);
    return saved ? JSON.parse(saved) : {
      completed: false,
      bookmarked: false,
      progress: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem(`learning-progress-${videoId}`, JSON.stringify(progress));
  }, [progress, videoId]);

  const handleComplete = () => {
    setProgress(prev => ({ ...prev, completed: !prev.completed }));
  };

  const handleBookmark = () => {
    setProgress(prev => ({ ...prev, bookmarked: !prev.bookmarked }));
  };

  const updateProgress = (value: number) => {
    setProgress(prev => ({ ...prev, progress: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Progress value={progress.progress} className="w-[200px]" />
          <span className="text-sm text-muted-foreground">
            {progress.progress}% Complete
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={progress.bookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
          >
            <BookmarkIcon className="h-4 w-4 mr-1" />
            {progress.bookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button
            variant={progress.completed ? "default" : "outline"}
            size="sm"
            onClick={handleComplete}
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            {progress.completed ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full" onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="sentences">Sentences</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
}

export function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsContent value={value} className="mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </TabsContent>
  );
} 