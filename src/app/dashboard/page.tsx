"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      const data: ApiResponse = await response.json();
      if (data.status === "success") {
        setTranscriptData(data);
        setIsSearching(false);
      } else {
        console.error("Error:", data.status);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
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

  return (
    <div className="container max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-montserrat">Learn with Clips</h1>
        {!isSearching && (
          <Button 
            onClick={() => setIsSearching(true)}
          >
            New Search
          </Button>
        )}
      </div>
      
      {isSearching && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL"
              className="flex-1 max-w-96"
            />
            <Select value={audioLanguage} onValueChange={setAudioLanguage}>
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
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
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

      {transcriptData?.status === "success" && (
        <VideoPlayer 
          videoUrl={videoUrl} 
          transcript={transcriptData.transcription}
          translation={transcriptData.translation}
          audioLanguage={audioLanguage}
          targetLanguage={targetLanguage}
        />
      )}
    </div>
  );
} 