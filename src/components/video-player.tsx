"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Subtitle {
  text: string;
  start: number;
  duration: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  transcript: Subtitle[];
  translation?: Subtitle[];
  audioLanguage?: string;
  targetLanguage?: string;
}

export function VideoPlayer({ 
  videoUrl, 
  transcript, 
  translation,
  audioLanguage = "es",
  targetLanguage = "en" 
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

  const getCurrentSubtitle = (subtitles: Subtitle[]) => {
    return subtitles.find(
      (item) => 
        currentTime >= item.start && 
        currentTime <= (item.start + item.duration)
    );
  };

  // Auto-scroll logic
  useEffect(() => {
    if (!isUserScrolling) {
      const currentOriginal = getCurrentSubtitle(transcript);
      const currentTranslation = translation && getCurrentSubtitle(translation);

      if (currentOriginal) {
        const originalElement = document.getElementById(`original-${currentOriginal.start}`);
        originalElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (currentTranslation) {
        const translationElement = document.getElementById(`translation-${currentTranslation.start}`);
        translationElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, isUserScrolling, transcript, translation]);

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

  const getLanguageEmoji = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'es':
        return '🇪🇸';
      case 'en':
        return '🇬🇧';
      default:
        return '🌐';
    }
  };

  return (
    <div className="relative space-y-4">
      {/* Subtitle controls */}
      <div className="flex items-center gap-6">
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

      <div className="relative">
        <div className="aspect-video">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={handleProgress}
            onReady={() => setIsReady(true)}
            className="rounded-lg"
            style={{ position: 'relative', zIndex: 10 }}
          />
        </div>

        {/* Floating subtitles */}
        {showFloatingSubtitles && (
          <div className="absolute bottom-16 left-0 right-0 mx-auto w-[90%] space-y-2 z-20">
            {showOriginalSubtitle && (
              <div className="min-h-[60px] bg-black/80 text-white p-4 rounded-lg flex items-center">
                <span className="mr-2 text-lg" role="img" aria-label={audioLanguage}>
                  {getLanguageEmoji(audioLanguage)}
                </span>
                <p className="text-center flex-1">
                  {getCurrentSubtitle(transcript)?.text || " "}
                </p>
              </div>
            )}
            {translation && showTranslationSubtitle && (
              <div className="min-h-[60px] bg-primary/80 text-white p-4 rounded-lg flex items-center">
                <span className="mr-2 text-lg" role="img" aria-label={targetLanguage}>
                  {getLanguageEmoji(targetLanguage)}
                </span>
                <p className="text-center flex-1">
                  {getCurrentSubtitle(translation)?.text || " "}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full transcript */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div 
            ref={originalTranscriptRef}
            className="h-[300px] overflow-y-auto"
            onScroll={handleScroll}
          >
            <div className="flex items-center mb-2 sticky top-0 bg-background p-2 border-b">
              <span className="mr-2 text-lg" role="img" aria-label={audioLanguage}>
                {getLanguageEmoji(audioLanguage)}
              </span>
              <h3 className="font-bold">Original</h3>
            </div>
            {transcript.map((item, index) => (
              <div
                key={`transcript-${index}-${item.duration}`}
                id={`original-${item.start}`}
                className={`p-2 hover:bg-muted cursor-pointer transition-colors ${
                  currentTime >= item.start && 
                  currentTime <= (item.start + item.duration)
                    ? "bg-primary/10"
                    : ""
                }`}
                onClick={() => handleSubtitleClick(item.start)}
              >
                <span className="text-sm text-muted-foreground">
                  {formatTime(item.start)}
                </span>
                <p className="font-inter">{item.text}</p>
              </div>
            ))}
          </div>
          {translation && (
            <div 
              ref={translationTranscriptRef}
              className="h-[300px] overflow-y-auto border-l pl-4"
              onScroll={handleScroll}
            >
              <div className="flex items-center mb-2 sticky top-0 bg-background p-2 border-b">
                <span className="mr-2 text-lg" role="img" aria-label={targetLanguage}>
                  {getLanguageEmoji(targetLanguage)}
                </span>
                <h3 className="font-semibold">Translation</h3>
              </div>
              {translation.map((item, index) => (
                <div
                  key={index}
                  id={`translation-${item.start}`}
                  className={`p-2 hover:bg-muted cursor-pointer transition-colors ${
                    currentTime >= item.start && 
                    currentTime <= (item.start + item.duration)
                      ? "bg-primary/10"
                      : ""
                  }`}
                  onClick={() => handleSubtitleClick(item.start)}
                >
                  <span className="text-sm text-muted-foreground">
                    {formatTime(item.start)}
                  </span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 