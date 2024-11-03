import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, CheckCircleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LearningTabsProps {
  videoId: string;
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  progress: number;
  onComplete: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  isCompleted: boolean;
}

export function LearningTabs({ 
  videoId, 
  children, 
  onTabChange, 
  progress,
  onComplete,
  onBookmark,
  isBookmarked,
  isCompleted
}: LearningTabsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-[200px]" />
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={onBookmark}
          >
            <BookmarkIcon className="h-4 w-4 mr-1" />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button
            variant={"outline"}
            size="sm"
            onClick={onComplete}
          >
            <CheckCircleIcon className={cn(
              "h-4 w-4 mr-1",
              isCompleted && "text-green-500"
            )} />
            {isCompleted ? "Completed" : "Mark Complete"}
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