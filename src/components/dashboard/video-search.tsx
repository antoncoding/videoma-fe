"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVideosStore } from "@/store/videos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Video, Languages } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { LANGUAGES } from "@/constants/languages";
import { useSettingsStore } from "@/store/settings";

interface VideoSearchProps {
  language: string;
  level: string;
}

export function VideoSearch({ language, level }: VideoSearchProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const addVideo = useVideosStore((state) => state.addVideo);
  const { settings } = useSettingsStore();

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/))([^"&?\/\s]{11})/);
    return match?.[1];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);

    try {
      // Add video with default title (we'll let user edit it in the video page)
      addVideo({
        id: videoId,
        customTitle: 'New Video',
        url: videoUrl,
        language: LANGUAGES[language].code,
      });

      router.push(`/videos/${videoId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Video className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Add a Video</h2>
            <p className="text-sm text-muted-foreground">
              Paste a YouTube URL to start learning
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-3 gap-2">
            <FaYoutube className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent px-0"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !videoUrl.trim()}>
            {loading ? "Adding..." : "Start Learning"}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground">
          <p>
            Learning {LANGUAGES[language].label} at{" "}
            <span className="font-medium">
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span> level
          </p>
        </div>
      </div>
    </Card>
  );
} 