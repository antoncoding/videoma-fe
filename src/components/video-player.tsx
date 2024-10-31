"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Info } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

interface Subtitle {
  text: string;
  start: number;
  duration: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  transcript: {
    source: string;
    data: Subtitle[];
  };
  translation?: {
    source: string;
    data: Subtitle[];
  };
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

  const { data: session } = useSession();

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

  const handleSaveSentence = async (
    original: Subtitle,
    translation?: Subtitle
  ) => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          video_url: videoUrl,
          video_title: document.title,
          original_text: original.text,
          translated_text: translation?.text,
          timestamp: original.start,
          original_language: audioLanguage,
          target_language: targetLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save sentence');
      }
      // Show success toast
    } catch (error) {
      console.error("Error saving sentence:", error);
      // Show error toast
    }
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
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-lg" role="img" aria-label={audioLanguage}>
                    {getLanguageEmoji(audioLanguage)}
                  </span>
                </div>
                <p className="text-center flex-1">
                  {getCurrentSubtitle(transcript.data)?.text || " "}
                </p>
              </div>
            )}
            {translation && showTranslationSubtitle && (
              <div className="min-h-[60px] bg-primary/80 text-white p-4 rounded-lg flex items-center">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-lg" role="img" aria-label={targetLanguage}>
                    {getLanguageEmoji(targetLanguage)}
                  </span>
                </div>
                <p className="text-center flex-1">
                  {getCurrentSubtitle(translation.data)?.text || " "}
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
            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b">
              <span className="text-lg" role="img" aria-label={audioLanguage}>
                {getLanguageEmoji(audioLanguage)}
              </span>
              <h3 className="font-bold">Original</h3>
              <Badge variant={transcript.source === "youtube" ? "secondary" : "default"}>
                {transcript.source === "youtube" ? "YouTube" : "Whisper AI"}
              </Badge>
            </div>
            {transcript.data.map((item, index) => (
              <div
                key={`transcript-${index}-${item.duration}`}
                id={`original-${item.start}`}
                className="group p-2 hover:bg-muted cursor-pointer transition-colors relative"
                onClick={() => handleSubtitleClick(item.start)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(item.start)}
                    </span>
                    <p className="font-inter">{item.text}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveSentence(item, translation?.data[index]);
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
            ))}
          </div>
          {translation && (
            <div 
              ref={translationTranscriptRef}
              className="h-[300px] overflow-y-auto border-l pl-4"
              onScroll={handleScroll}
            >
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background p-2 border-b">
                <span className="text-lg" role="img" aria-label={targetLanguage}>
                  {getLanguageEmoji(targetLanguage)}
                </span>
                <h3 className="font-semibold">Translation</h3>
                <Badge variant={translation.source === "youtube" ? "secondary" : "default"}>
                  {translation.source === "youtube" ? "YouTube" : "AI Translated"}
                </Badge>
              </div>
              {translation.data.map((item, index) => (
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