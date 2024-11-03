export interface VocabularyWord {
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: Array<{
    sentence: string;
    translation: string;
    audioUrl?: string;
  }>;
}

export interface SentenceAnalysis {
  original: string;
  translation: string;
  breakdown: Array<{
    word: string;
    translation: string;
    explanation?: string;
  }>;
  grammar: {
    tense: string;
    explanation: string;
  };
  similarExamples: Array<{
    sentence: string;
    translation: string;
  }>;
  context: {
    explanation: string;
    usage: string;
  };
}

export interface LearningSession {
  id: string;
  title: string;
  introduction: {
    message: string;
  };
  vocabulary: VocabularyWord[];
  sentences: SentenceAnalysis[];
  exercises: Array<{
    type: 'fill-in-blank' | 'multiple-choice' | 'translation';
    question: string;
    answer: string;
    options?: string[];
    explanation: string;
  }>;
  summary: {
    keyPoints: string[];
    nextSteps: string;
  };
}

export interface VocabularyHighlight {
  type: 'word' | 'sentence';
  content: string;
  timestamp: number;
  context: string;
} 