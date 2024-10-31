"use client";

import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";

interface Subtitle {
  start: number;
  duration: number;
  text: string;
}

interface VideoPlayerProps {
  videoUrl: string;
  transcript: Subtitle[];
}

export function VideoPlayer({ videoUrl, transcript }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const getCurrentSubtitle = () => {
    return transcript.find(
      (item) => 
        currentTime >= item.start && 
        currentTime <= (item.start + item.duration)
    );
  };

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setCurrentTime(playedSeconds);
  };

  const handleSubtitleClick = (startTime: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
    }
  };

  return (
    <div className="relative">
      <Card className="p-4">
        <div className="aspect-video mb-4">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={handleProgress}
            onReady={() => setIsReady(true)}
            className="rounded-lg"
          />
        </div>

        {/* Floating subtitle */}
        <div className="absolute bottom-20 left-0 right-0 mx-auto w-[90%] bg-black/80 text-white p-4 rounded-lg text-center">
          {getCurrentSubtitle()?.text || ""}
        </div>

        {/* Full transcript */}
        <div className="h-[300px] overflow-y-auto">
          {transcript.map((item, index) => (
            <div
              key={index}
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
      </Card>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 