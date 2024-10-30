"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          language: "es",
        }),
      });
      
      const data = await response.json();
      if (data.transcript) {
        setTranscript(data.transcript);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Video Learning Dashboard</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={videoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Transcript"}
          </Button>
        </div>
      </form>

      {transcript.length > 0 && (
        <Card className="p-4">
          <div className="aspect-video mb-4">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getVideoId(videoUrl)}`}
              allowFullScreen
              className="rounded-lg"
            />
          </div>
          
          <div className="h-[300px] overflow-y-auto">
            {transcript.map((item, index) => (
              <div
                key={index}
                className="p-2 hover:bg-muted cursor-pointer"
                onClick={() => {
                  // TODO: Implement timestamp jumping
                }}
              >
                <span className="text-sm text-muted-foreground">
                  {formatTime(item.start)}
                </span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function getVideoId(url: string) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 