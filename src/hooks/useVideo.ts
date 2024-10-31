import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface VideoMetadata {
  id: string;
  title: string;
  url: string;
}

export function useVideo(videoId: string) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVideoMetadata = async (url: string): Promise<VideoMetadata> => {
    // TODO: Implement YouTube API call to get video details
    // For now, return mock data
    return {
      id: videoId,
      title: "Video Title", // This should come from YouTube API
      url: url
    };
  };

  return {
    fetchVideoMetadata,
    loading
  };
} 