import { VOICE_PROFILES } from '@/constants/voices';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceSettings {
  voiceId: string;
}

interface VoiceState {
  voices: Record<string, VoiceSettings>;
}

interface VoiceStore extends VoiceState {
  setVoice: (languageCode: string, voiceId: string) => void;
  removeVoice: (languageCode: string) => void;
  getVoiceForLanguage: (languageCode: string) => string;
}

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set, get) => ({
      voices: {},
      
      setVoice: (languageCode, voiceId) =>
        set((state) => ({
          voices: {
            ...state.voices,
            [languageCode]: { voiceId },
          },
        })),
      
      removeVoice: (languageCode) =>
        set((state) => {
          const { [languageCode]: _, ...rest } = state.voices;
          return { voices: rest };
        }),

      getVoiceForLanguage: (languageCode) => 
        get().voices[languageCode]?.voiceId ?? VOICE_PROFILES[languageCode][0].id as string,
    }),
    {
      name: 'voice-settings',
    }
  )
); 