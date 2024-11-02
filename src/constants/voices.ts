export interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  personality: string;
  description: string;
}

export const SPANISH_VOICES: VoiceProfile[] = [
  {
    id: 'jorge',
    name: 'Jorge',
    language: 'es',
    gender: 'male',
    personality: 'Patient and methodical',
    description: 'A calm and structured teacher who explains concepts step by step'
  },
  {
    id: 'enrique',
    name: 'Enrique',
    language: 'es',
    gender: 'male',
    personality: 'Energetic and encouraging',
    description: 'An enthusiastic teacher who makes learning fun and engaging'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    language: 'es',
    gender: 'female',
    personality: 'Warm and supportive',
    description: 'A nurturing teacher who builds confidence through positive reinforcement'
  },
  {
    id: 'dolores',
    name: 'Dolores',
    language: 'es',
    gender: 'female',
    personality: 'Professional and precise',
    description: 'A detail-oriented teacher focused on perfect pronunciation'
  },
];

export const CHINESE_VOICES: VoiceProfile[] = [
  {
    id: 'chen',
    name: 'Chen',
    language: 'zh_tw',
    gender: 'male',
    personality: 'Systematic and thorough',
    description: 'A methodical teacher focusing on proper pronunciation and writing'
  },
  {
    id: 'yili',
    name: 'Yili',
    language: 'zh_tw',
    gender: 'female',
    personality: 'Encouraging and patient',
    description: 'A supportive teacher who helps you master tones and characters'
  },
];

export const FRENCH_VOICES: VoiceProfile[] = [
  {
    id: 'josephine',
    name: 'Josephine',
    language: 'fr',
    gender: 'female',
    personality: 'Elegant and articulate',
    description: 'A refined teacher who emphasizes proper accent and cultural context'
  },
  {
    id: 'laurent',
    name: 'Laurent',
    language: 'fr',
    gender: 'male',
    personality: 'Engaging and witty',
    description: 'A charismatic teacher who makes learning French culture fun'
  },
];

// @notice: for English, the voices are for chatgpt, not same as AI teacher name
export const ENGLISH_VOICES: VoiceProfile[] = [
  {
    id: 'echo',
    name: 'James',
    language: 'en',
    gender: 'male',
    personality: 'Clear and supportive',
    description: 'An energetic teacher with a clear and engaging voice'
  },
  {
    id: 'nova',
    name: 'Nova',
    language: 'en',
    gender: 'female',
    personality: 'Professional and precise',
    description: 'An experienced teacher focusing on business English'
  },
];


export const JAPANESE_VOICES: VoiceProfile[] = [
  {
    id: 'kaori',
    name: 'Kaori',
    language: 'ja',
    gender: 'female',
    personality: 'Professional and precise',
    description: 'An experienced teacher focusing on business English'
  },
  {
    id: 'mariko',
    name: 'Mariko',
    language: 'ja',
    gender: 'female',
    personality: 'Gentle and patient',
    description: 'A nurturing teacher who builds confidence through positive reinforcement'
  },
  {
    id: 'takeshi',
    name: 'Takeshi',
    language: 'ja',
    gender: 'male',
    personality: 'Energetic and encouraging',
    description: 'An enthusiastic teacher who makes learning fun and engaging'
  }
];
export const VOICE_PROFILES: Record<string, VoiceProfile[]> = {
  es: SPANISH_VOICES,
  zh_tw: CHINESE_VOICES,
  fr: FRENCH_VOICES,
  en: ENGLISH_VOICES,
  ja: JAPANESE_VOICES,
}; 