"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVideosStore } from "@/store/videos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", flag: "🇫🇷" },
] as const;

type LanguageCode = typeof LANGUAGES[number]["code"];

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState("");
  const [audioLanguage, setAudioLanguage] = useState<LanguageCode>("es");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const addVideo = useVideosStore((state) => state.addVideo);

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/);
    return match?.[1];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (audioLanguage === targetLanguage) {
      setError("Source and target languages must be different");
      return;
    }

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);

    try {
      addVideo({
        id: videoId,
        customTitle: 'new video',
        url: videoUrl,
        language: audioLanguage,
      });

      router.push(`/videos/${videoId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Add New Video</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube URL"
              className="flex-1"
              disabled={loading}
            />
            <Select
              value={audioLanguage}
              onValueChange={(value) => setAudioLanguage(value as LanguageCode)}
              disabled={loading}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Original" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      {lang.flag} {lang.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">→</span>
            <Select
              value={targetLanguage}
              onValueChange={(value) => setTargetLanguage(value as LanguageCode)}
              disabled={loading}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      {lang.flag} {lang.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Learn"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 