"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Info, AlertCircle } from "lucide-react";
import { useSentenceManager } from '@/hooks/useSentenceManager';
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
  transcript?: TranscriptData;
  translation?: TranscriptData;
  audioLanguage?: string;
  isLoading?: boolean;
  initialTime?: number;
  error?: string | null;
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

  const { handleSaveSentence, isLoading: isSaving } = useSentenceManager();

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

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setCurrentTime(playedSeconds);
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

  const onSaveSentence = async (
    original: Subtitle,
  ) => {

    if (!transcript) return;

    // find corresponding translation
    const translationSubtitle = translation?.data.find(
      (item) => item.start === original.start
    );

    await handleSaveSentence({
      original,
      translation: translationSubtitle,
      videoUrl,
      videoId,
      timestamp: original.start,
      audioLanguage,
      targetLanguage: assistingLanguage,
      source: transcript.source,
    });
  };

  const handleShowDetails = (
    original: Subtitle,
    translation?: Subtitle
  ) => {
    // We'll implement this later
    console.log("Show details for:", original, translation);
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

  const handleHighlight = (subtitle: Subtitle) => {
    if (!selectedText) return;

    const highlight: VocabularyHighlight = {
      type: selectedText.type,
      content: selectedText.text,
      timestamp: subtitle.start,
      context: subtitle.text,
    };

    addHighlight(videoId, highlight);
    setSelectedText(null);

    toast({
      title: "✨ Added to vocabulary list",
      description: `${selectedText.type === 'word' ? 'Word' : 'Sentence'} saved for learning`,
    });
  };

  const renderSubtitleText = (subtitle: Subtitle, isTranslation: boolean = false) => {
    const subtitleId = `${subtitle.start}-${subtitle.text}`;
    const existingHighlights = highlights.filter(h => h.context === subtitle.text);
    const words = subtitle.text.split(' ');
    
    return (
      <div className="relative group">
        {/* Timestamp */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+0.5rem)] 
          text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(subtitle.start)}
        </div>

        {/* Text content */}
        <div
          className={cn(
            "p-2 rounded transition-colors",
            currentTime >= subtitle.start && 
            currentTime <= (subtitle.start + subtitle.duration) && 
            "bg-accent/50",
            "hover:bg-accent/20"
          )}
        >
          <div className="flex justify-between items-start gap-2">
            <p
              className={cn(
                "flex-1",
                existingHighlights.some(h => h.type === 'sentence') && "bg-yellow-100/50 rounded px-1"
              )}
              onClick={() => handleSubtitleClick(subtitle.start)}
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
                
                return (
                  <span
                    key={idx}
                    className={cn(
                      "cursor-pointer px-0.5 rounded",
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

            {/* Action buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => onSaveSentence(subtitle)}
                disabled={isSaving}
              >
                <Star className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => handleShowDetails(subtitle)}
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative space-y-4">
      {/* Video player section */}
      <div className="relative">
        <div className="aspect-video">
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
      <div>
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
                  <Badge> No transcript </Badge>
                ) : (
                  <Badge variant={transcript.source === "youtube" ? "secondary" : "default"}>
                    {transcript.source === "youtube" ? "YouTube" : "Whisper AI"}
                  </Badge>
                )}
              </div>
              
              {transcript && transcript.data.map((item, index) => (
                <div
                  key={`${item.start}-${index}`}
                  id={`original-${item.start}`}
                  className={cn(
                    "p-2 rounded subtitle-item",
                    currentTime >= item.start && 
                    currentTime <= (item.start + item.duration) && 
                    "bg-accent"
                  )}
                  onClick={() => handleSubtitleClick(item.start)}
                >
                  {renderSubtitleText(item)}
                </div>
              ))}
            </div>

            {/* Translation column */}
            <div 
              ref={translationTranscriptRef}
              className="h-[300px] overflow-y-auto border-l pl-4 relative"
              onScroll={handleScroll}
            >
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b z-10">
                <span className="text-lg" role="img" aria-label={assistingLanguage}>
                  {getLanguageEmoji(assistingLanguage)}
                </span>
                <h3 className="font-semibold">Translation</h3>
                {hasTranslationError ? (
                  <Badge >Error</Badge>
                ) : (
                  <Badge variant={translation?.source === "youtube_translation" ? "secondary" : "default"}>
                    {translation?.source === "youtube_translation" ? "YouTube" : "AI Translated"}
                  </Badge>
                )}
              </div>
              
              {hasTranslationError ? (
                <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>Failed to load translation</p>
                  <p className="text-sm">Please try refreshing the page</p>
                </div>
              ) : (
                hasValidTranslation && translation.data.map((item, index) => (
                  <div
                    key={index}
                    id={`translation-${item.start}`}
                    className={`group p-2 hover:bg-muted cursor-pointer transition-colors relative ${
                      currentTime >= item.start && 
                      currentTime <= (item.start + item.duration)
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onClick={() => handleSubtitleClick(item.start)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(item.start)}
                        </span>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
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