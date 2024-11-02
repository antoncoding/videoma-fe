"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Info, AlertCircle } from "lucide-react";
import { useSentenceManager } from '@/hooks/useSentenceManager';
import { useSettingsStore } from '@/store/settings';

interface Subtitle {
  text: string;
  start: number;
  duration: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  transcript: {
    source: string;
    data: Subtitle[];
  };
  translation?: {
    source: string;
    data: Subtitle[];
  };
  audioLanguage?: string;
  isLoading?: boolean;
  initialTime?: number;
}

export function VideoPlayer({ 
  videoUrl,
  videoId,
  transcript, 
  translation,
  audioLanguage = 'es',
  isLoading = false,
  initialTime = 0,
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

  const { settings } = useSettingsStore();
  const targetLanguage = settings.nativeLanguage || 'en';

  console.log('transcript.data', transcript.data)
  console.log('translation.data', translation)

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
    if (!isUserScrolling && isPlaying) {
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
    }
  };

  const getLanguageEmoji = (lang: string = 'en') => {
    switch (lang.toLowerCase()) {
      case 'es':
        return '🇪🇸';
      case 'en':
        return '🇬🇧';
      case 'fr':
        return '🇫🇷';
      default:
        return '🌐';
    }
  };

  const onSaveSentence = async (
    original: Subtitle,
  ) => {

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
      targetLanguage,
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

  return (
    <div className="relative space-y-4">
      {/* Video player with reduced max-width */}
      <div className="relative max-w-[800px] mx-auto">
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
          />
        </div>

        {/* Floating subtitles positioned higher */}
        {showFloatingSubtitles && !isLoading && (
          <div className="absolute bottom-12 left-0 right-0 mx-auto w-[90%] space-y-2">
            {showOriginalSubtitle && (
              <div className="min-h-[60px] bg-black/80 text-white p-4 rounded-lg flex items-center">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-lg" role="img" aria-label={audioLanguage}>
                    {getLanguageEmoji(audioLanguage)}
                  </span>
                </div>
                {hasTranscriptError ? (
                  <p className="text-center flex-1 text-red-400">
                    No captions available
                  </p>
                ) : (
                  <p className="text-center flex-1">
                    {getCurrentSubtitle(transcript.data)?.text || " "}
                  </p>
                )}
              </div>
            )}
            {showTranslationSubtitle && (
              <div className="min-h-[60px] bg-primary/80 text-white p-4 rounded-lg flex items-center">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-lg" role="img" aria-label={targetLanguage}>
                    {getLanguageEmoji(targetLanguage)}
                  </span>
                </div>
                {hasTranslationError ? (
                  <p className="text-center flex-1 text-red-400">
                    Translation not available
                  </p>
                ) : (
                  <p className="text-center flex-1">
                    {getCurrentSubtitle(translation?.data)?.text || " "}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls and transcripts */}
      <div className="max-w-[800px] mx-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-[300px] bg-muted rounded" />
                <div className="h-[300px] bg-muted rounded" />
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Subtitle controls */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="floating-subtitles"
                  checked={showFloatingSubtitles}
                  onCheckedChange={setShowFloatingSubtitles}
                  className="font-inter"
                />
                <Label htmlFor="floating-subtitles">Show floating subtitles</Label>
              </div>
              {showFloatingSubtitles && (
                <>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="original-subtitle"
                      checked={showOriginalSubtitle}
                      onCheckedChange={setShowOriginalSubtitle}
                    />
                    <Label htmlFor="original-subtitle">Show original</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="translation-subtitle"
                      checked={showTranslationSubtitle}
                      onCheckedChange={setShowTranslationSubtitle}
                    />
                    <Label htmlFor="translation-subtitle">Show translation</Label>
                  </div>
                </>
              )}
            </div>

            {/* Full transcript */}
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  ref={originalTranscriptRef}
                  className="h-[300px] overflow-y-auto relative"
                  onScroll={handleScroll}
                >
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b z-10">
                    <span className="text-lg" role="img" aria-label={audioLanguage}>
                      {getLanguageEmoji(audioLanguage)}
                    </span>
                    <h3 className="font-bold">Original</h3>
                    <Badge variant={transcript.source === "youtube" ? "secondary" : "default"}>
                      {transcript.source === "youtube" ? "YouTube" : "Whisper AI"}
                    </Badge>
                  </div>
                  {hasTranscriptError ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p>No captions available</p>
                    </div>
                  ) : (
                    transcript.data.map((item, index) => (
                      <div
                        key={`transcript-${index}-${item.duration}`}
                        id={`original-${item.start}`}
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
                            <p className="font-inter">{item.text}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSaveSentence(item);
                              }}
                              className="p-1 hover:bg-primary/20 rounded"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowDetails(item, translation?.data[index]);
                              }}
                              className="p-1 hover:bg-primary/20 rounded"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div 
                  ref={translationTranscriptRef}
                  className="h-[300px] overflow-y-auto border-l pl-4 relative"
                  onScroll={handleScroll}
                >
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b z-10">
                    <span className="text-lg" role="img" aria-label={targetLanguage}>
                      {getLanguageEmoji(targetLanguage)}
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
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 