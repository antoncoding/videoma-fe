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

export const VOICE_PROFILES = {
  es: SPANISH_VOICES,
  // Add other languages later
}; 