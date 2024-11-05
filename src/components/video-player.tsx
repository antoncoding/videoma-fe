"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Loader2 } from "lucide-react";
import { useLanguageSettings } from '@/hooks/useLanguageSettings';
import { LANGUAGES, getLanguageEmoji } from "@/constants/languages";
import { useHighlightsStore } from '@/store/highlights';
import { VocabularyHighlight } from '@/types/vocabulary';
import { TranscriptData, Subtitle } from '@/types/subtitle';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  transcript: TranscriptData | null;
  translation: TranscriptData | null;
  audioLanguage?: string;
  isLoading?: boolean;
  initialTime?: number;
  error?: string | null;
  loadMoreTranslationsIfNeeded: (currentTimestamp: number) => Promise<void>;
}

interface HighlightState {
  text: string;
  type: 'word' | 'sentence';
  subtitleId: string;
}

export function VideoPlayer({
  videoUrl,
  videoId,
  transcript,
  translation,
  audioLanguage = 'es',
  isLoading = false,
  initialTime = 0,
  error,
  loadMoreTranslationsIfNeeded,
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const originalTranscriptRef = useRef<HTMLDivElement>(null);
  const translationTranscriptRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showFloatingSubtitles, setShowFloatingSubtitles] = useState(true);
  const [showOriginalSubtitle, setShowOriginalSubtitle] = useState(true);
  const [showTranslationSubtitle, setShowTranslationSubtitle] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { addHighlight, getHighlightsForVideo } = useHighlightsStore();
  const [selectedText, setSelectedText] = useState<HighlightState | null>(null);
  const highlights = getHighlightsForVideo(videoId);

  const {
    primaryLanguage,
    getAssistingLanguage,
  } = useLanguageSettings();

  const assistingLanguage = getAssistingLanguage(audioLanguage);

  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [hasLoadedAllTranslations, setHasLoadedAllTranslations] = useState(false);

  const getCurrentSubtitle = (subtitles?: Subtitle[]) => {
    if (!subtitles || !Array.isArray(subtitles)) return null;

    return subtitles.find(
      (item) =>
        currentTime >= item.start &&
        currentTime <= (item.start + item.duration)
    );
  };

  const hasValidTranscript = transcript?.data && Array.isArray(transcript.data);
  const hasValidTranslation = translation?.data && Array.isArray(translation.data);
  const hasTranscriptError = !hasValidTranscript;
  const hasTranslationError = translation && !hasValidTranslation;

  // Auto-scroll logic - only when playing
  useEffect(() => {
    if (!isUserScrolling && isPlaying && transcript) {
      const currentOriginal = getCurrentSubtitle(transcript.data);
      const currentTranslation = translation && getCurrentSubtitle(translation.data);

      if (currentOriginal) {
        const originalElement = document.getElementById(`original-${currentOriginal.start}`);
        originalElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (currentTranslation) {
        const translationElement = document.getElementById(`translation-${currentTranslation.start}`);
        translationElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, isUserScrolling, transcript, translation, isPlaying]);

  const handleScroll = () => {
    setIsUserScrolling(true);
    // Reset after 5 seconds of no scrolling
    const timer = setTimeout(() => setIsUserScrolling(false), 5000);
    return () => clearTimeout(timer);
  };

  const handleProgress = async ({ playedSeconds }: { playedSeconds: number }) => {
    setCurrentTime(playedSeconds);
    
    // Check if we need to load translations for any previous segments
    if (translation?.data && transcript?.data) {
      const translatedTimestamps = new Set(translation.data.map(t => t.start));
      const missingTranslations = transcript.data
        .filter(t => t.start <= playedSeconds && !translatedTimestamps.has(t.start));

      if (missingTranslations.length > 0) {
        setIsLoadingTranslations(true);
        try {
          await loadMoreTranslationsIfNeeded(playedSeconds);
        } finally {
          setIsLoadingTranslations(false);
        }
      }
    }
  };

  const handleSubtitleClick = (startTime: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
      // Ensure video plays after seeking
      if (!isPlaying) {
        playerRef.current.getInternalPlayer()?.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleTextSelection = (
    event: MouseEvent,
    type: 'word' | 'sentence',
    text: string,
    subtitleId: string
  ) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setSelectedText(null);
      return;
    }

    setSelectedText({
      text: selectedText,
      type,
      subtitleId
    });
  };

  const renderSubtitleText = (subtitle: Subtitle, isTranslation: boolean = false) => {
    const subtitleId = `${subtitle.start}-${subtitle.text}`;
    const existingHighlights = highlights.filter(h => h.context === subtitle.text);
    const words = subtitle.text.split(' ');

    return (
      <div 
        className={cn(
          "group p-2 hover:bg-muted cursor-pointer transition-colors rounded",
          currentTime >= subtitle.start && 
          currentTime <= (subtitle.start + subtitle.duration) && 
          "bg-primary/10"
        )}
        onClick={() => handleSubtitleClick(subtitle.start)}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <span className="text-sm text-muted-foreground">
              {formatTime(subtitle.start)}
            </span>
            {!isTranslation ? (
              <p
                className={cn(
                  "mt-1",
                  existingHighlights.some(h => h.type === 'sentence') && 
                  "bg-yellow-100/50 rounded px-1"
                )}
                onMouseUp={(e) => {
                  const selection = window.getSelection();
                  if (selection && selection.toString().includes(' ')) {
                    handleTextSelection(e.nativeEvent, 'sentence', subtitle.text, subtitleId);
                  }
                }}
              >
                {words.map((word, idx) => {
                  const isHighlighted = existingHighlights.some(
                    h => h.type === 'word' && h.content === word
                  );

                  // add words to highlights
                  return (
                    <span
                      key={idx}
                      className={cn(
                        "cursor-pointer rounded px-0.5",
                        isHighlighted && "bg-yellow-200/50",
                        "hover:bg-primary/10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        const highlight: VocabularyHighlight = {
                          type: 'word',
                          content: word,
                          timestamp: subtitle.start,
                          context: subtitle.text,
                        };
                        addHighlight(videoId, highlight);
                        toast({
                          title: "✨ Word added",
                          description: `Added "${word}" to vocabulary list`,
                        });
                      }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            ) : (
              <p className="mt-1">{subtitle.text}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isTranslation && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  addHighlight(videoId, {
                    type: 'sentence',
                    content: subtitle.text,
                    timestamp: subtitle.start,
                    context: subtitle.text,
                  });
                }}
              >
                <PlusCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleLoadMoreTranslations = async () => {
    if (!transcript?.data || !translation?.data) return;
    
    setIsLoadingTranslations(true);
    try {
      // Get the last translated timestamp
      const lastTranslatedTimestamp = Math.max(...translation.data.map(t => t.start));
      // Find the next chunk of untranslated segments
      const nextUntranslatedSegments = transcript.data
        .filter(t => t.start > lastTranslatedTimestamp)
        .slice(0, 10); // Load 10 segments at a time
      
      if (nextUntranslatedSegments.length > 0) {
        await loadMoreTranslationsIfNeeded(nextUntranslatedSegments[nextUntranslatedSegments.length - 1].start);
      } else {
        setHasLoadedAllTranslations(true);
      }
    } finally {
      setIsLoadingTranslations(false);
    }
  };

  return (
    <div className="relative space-y-4 w-full max-w-[1000px] mx-auto">
      {/* Video player section */}
      <div className="relative w-full">
        <div className="aspect-video w-full">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={handleProgress}
            onReady={() => {
              setIsReady(true);
              if (initialTime > 0) {
                playerRef.current?.seekTo(initialTime);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="rounded-lg"
            config={{
              youtube: {
                playerVars: {
                  // Disable related videos at the end (will show videos from same channel)
                  rel: 0,
                  // Disable keyboard controls
                  disablekb: 1,
                  // Don't show video annotations
                  iv_load_policy: 3,
                  // Disable fullscreen button
                  fs: 0,
                  // Play inline on iOS
                  playsinline: 1,
                  // Disable closed captions by default (based on user preference)
                  cc_load_policy: 0
                }
              }
            }}
          />
        </div>

        {/* Floating subtitles */}
        {showFloatingSubtitles && !isLoading && (
          <div className="absolute bottom-12 left-0 right-0 mx-auto w-[90%] space-y-2">
            {showOriginalSubtitle && transcript && (
              <div className="min-h-[60px] bg-black/80 text-white p-4 rounded-lg flex items-center">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-lg" role="img" aria-label={LANGUAGES[audioLanguage]?.label}>
                    {LANGUAGES[audioLanguage].flag}
                  </span>
                </div>
                <p className="text-center flex-1">
                  {isLoading ? (
                    <span className="animate-pulse">✨ Transcribing...</span>
                  ) : (
                    getCurrentSubtitle(transcript.data)?.text || " "
                  )}
                </p>
              </div>
            )}
            {showTranslationSubtitle && (
              <div className="min-h-[60px] bg-primary/80 text-white p-4 rounded-lg flex items-center">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-lg" role="img" aria-label={LANGUAGES[assistingLanguage]?.label}>
                    {LANGUAGES[assistingLanguage].flag}
                  </span>
                  {assistingLanguage !== primaryLanguage && (
                    <Badge variant="secondary" className="text-xs">
                      Custom translation
                    </Badge>
                  )}
                </div>
                <p className="text-center flex-1">
                  {isLoading ? (
                    <span className="animate-pulse">✨ Translating...</span>
                  ) : (
                    translation && getCurrentSubtitle(translation.data)?.text || " "
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls and transcripts */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showFloatingSubtitles}
                onCheckedChange={setShowFloatingSubtitles}
                disabled={isLoading}
              />
              <Label>Show floating subtitles</Label>
            </div>
            {showFloatingSubtitles && (
              <>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showOriginalSubtitle}
                    onCheckedChange={setShowOriginalSubtitle}
                    disabled={isLoading}
                  />
                  <Label>Show original</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showTranslationSubtitle}
                    onCheckedChange={setShowTranslationSubtitle}
                    disabled={isLoading}
                  />
                  <Label>Show translation</Label>
                </div>
              </>
            )}
          </div>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Original transcript */}
            <div
              ref={originalTranscriptRef}
              className="h-[300px] overflow-y-auto relative"
              onScroll={handleScroll}
            >
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b z-10">
                <span className="text-lg">{getLanguageEmoji(audioLanguage)}</span>
                <h3 className="font-semibold">Original</h3>
                {isLoading ? (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    ✨ Transcribing...
                  </span>
                ) : !transcript ? (
                  <Badge>No transcript</Badge>
                ) : (
                  <Badge variant={transcript.source === "youtube" ? "secondary" : "default"}>
                    {transcript.source === "youtube" ? "YouTube" : "Whisper AI"}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {transcript && transcript.data.map((item, index) => (
                  <div key={`${item.start}-${index}`} id={`original-${item.start}`}>
                    {renderSubtitleText(item, false)}
                  </div>
                ))}
              </div>
            </div>

            {/* Translation column */}
            <div
              ref={translationTranscriptRef}
              className="h-[300px] overflow-y-auto border-l pl-4 relative"
              onScroll={handleScroll}
            >
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b z-10">
                <span className="text-lg">{getLanguageEmoji(assistingLanguage)}</span>
                <h3 className="font-semibold">Translation</h3>
                {hasTranslationError ? (
                  <Badge>Error</Badge>
                ) : (
                  <>
                    <Badge variant={translation?.source === "youtube_translation" ? "secondary" : "default"}>
                      {translation?.source === "youtube_translation" ? "YouTube" : "AI Translated"}
                    </Badge>
                    {isLoadingTranslations && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </>
                )}
              </div>

              <div className="space-y-1">
                {hasValidTranslation && translation.data.map((item, index) => (
                  <div key={`${item.start}-${index}`} id={`translation-${item.start}`}>
                    {renderSubtitleText(item, true)}
                  </div>
                ))}
                
                {/* Load more button */}
                {hasValidTranslation && !hasLoadedAllTranslations && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    onClick={handleLoadMoreTranslations}
                    disabled={isLoadingTranslations}
                  >
                    {isLoadingTranslations ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Load more translations
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 