"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoPlayer } from "@/components/video-player";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RxCrossCircled } from "react-icons/rx";


interface TranscriptData {
  text: string;
  start: number;
  duration: number;
}

interface ApiResponse {
  status: string;
  transcription: {
    source: string;
    success: boolean;
    data: TranscriptData[];
  };
  translation?: {
    source: string;
    success: boolean;
    data: TranscriptData[];
  };
}

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState("");
  const [audioLanguage, setAudioLanguage] = useState("es");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [transcriptData, setTranscriptData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    if (!validateYouTubeUrl(videoUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          audio_language: audioLanguage,
          target_language: targetLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      if (data.status === "success" && data.transcription?.data) {
        setTranscriptData(data);
        setIsSearching(false);
        setError(null);
      } else {
        setError(data.status || "Failed to process video");
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setError(error instanceof Error ? error.message : "Failed to process video");
    } finally {
      setLoading(false);
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

  const handleReset = () => {
    setIsSearching(true);
    setError(null);
    setTranscriptData(null);
    setVideoUrl("");
  };

  return (
    <div className="container max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-montserrat">Learn with Clips</h1>
        {!isSearching && (
          <Button onClick={handleReset}>
            New Search
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <RxCrossCircled className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isSearching && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL"
              className="flex-1 max-w-96"
              disabled={loading}
            />
            <Select 
              value={audioLanguage} 
              onValueChange={setAudioLanguage}
              disabled={loading}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    {getLanguageEmoji(audioLanguage)}
                    {' '}Original
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">
                  <span className="flex items-center gap-2">
                    🇪🇸 Spanish
                  </span>
                </SelectItem>
                <SelectItem value="en">
                  <span className="flex items-center gap-2">
                    🇬🇧 English
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={targetLanguage} 
              onValueChange={setTargetLanguage}
              disabled={loading}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    {getLanguageEmoji(targetLanguage)}
                    {' '}Target
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <span className="flex items-center gap-2">
                    🇬🇧 English
                  </span>
                </SelectItem>
                <SelectItem value="es">
                  <span className="flex items-center gap-2">
                    🇪🇸 Spanish
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Learn"}
            </Button>
          </div>
        </form>
      )}

      {transcriptData?.status === "success" && transcriptData.transcription?.data && (
        <div className="relative">
          <ErrorBoundary fallback={<div>Error loading video player</div>}>
            <VideoPlayer 
              videoUrl={videoUrl} 
              transcript={transcriptData.transcription}
              translation={transcriptData.translation}
              audioLanguage={audioLanguage}
              targetLanguage={targetLanguage}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Video player error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
} 