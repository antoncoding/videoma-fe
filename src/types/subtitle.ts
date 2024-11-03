export interface Subtitle {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptData {
  source: string;
  data: Subtitle[];
} 