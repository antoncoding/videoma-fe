import { useHighlightsStore } from '@/store/highlights';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Book } from 'lucide-react';

interface VocabularyPanelProps {
  videoId: string;
  onGenerateSession: () => void;
  isGenerating: boolean;
}

export function VocabularyPanel({ videoId, onGenerateSession, isGenerating }: VocabularyPanelProps) {
  const { getHighlightsForVideo, removeHighlight } = useHighlightsStore();
  const highlights = getHighlightsForVideo(videoId);

  const words = highlights.filter(h => h.type === 'word');
  const sentences = highlights.filter(h => h.type === 'sentence');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Vocabulary List</h3>
        {highlights.length > 0 && (
          <Button 
            size="sm" 
            onClick={onGenerateSession}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Book className="w-4 h-4 mr-2" />
                Generate Lesson
              </>
            )}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        {words.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Words</h4>
            <div className="space-y-2">
              {words.map((highlight) => (
                <div 
                  key={`${highlight.content}-${highlight.timestamp}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent/10"
                >
                  <div>
                    <p className="font-medium">{highlight.content}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {highlight.context}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeHighlight(videoId, highlight.content)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sentences.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Sentences</h4>
            <div className="space-y-2">
              {sentences.map((highlight) => (
                <div 
                  key={`${highlight.content}-${highlight.timestamp}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent/10"
                >
                  <div className="flex-1">
                    <p className="font-medium">{highlight.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(highlight.timestamp * 1000).toISOString().substr(11, 8)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeHighlight(videoId, highlight.content)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {highlights.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Select words or sentences to add them to your vocabulary list
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 