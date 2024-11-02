import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LevelValue } from '@/constants/levels';

interface LanguageVoiceSettings {
  voiceId: string;
}

interface TargetLanguage {
  code: string;
  level: LevelValue;
}

interface UserSettings {
  nativeLanguage: string;
  targetLanguages: TargetLanguage[];
  languageVoices: Record<string, LanguageVoiceSettings>;
}

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
  updateLanguageLevel: (languageCode: string, level: LevelValue) => void;
  updateLanguageVoice: (languageCode: string, voiceId: string) => void;
  getCurrentLanguage: () => TargetLanguage | undefined;
  getCurrentVoice: () => string | undefined;
  addLanguageClass: (code: string, level: LevelValue, voiceId: string) => void;
  removeLanguageClass: (code: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: {
        nativeLanguage: "en",
        targetLanguages: [{ code: "es", level: "beginner" }],
        languageVoices: {},
      },
      updateSettings: (newSettings) => set({ settings: newSettings }),
      
      updateLanguageLevel: (languageCode, level) => 
        set((state) => ({
          settings: {
            ...state.settings,
            targetLanguages: state.settings.targetLanguages.map(lang => 
              lang.code === languageCode ? { ...lang, level } : lang
            ),
          },
        })),

      updateLanguageVoice: (languageCode, voiceId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            languageVoices: {
              ...state.settings.languageVoices,
              [languageCode]: { voiceId },
            },
          },
        })),

      getCurrentLanguage: () => {
        const state = get();
        return state.settings.targetLanguages[0];
      },

      getCurrentVoice: () => {
        const state = get();
        const currentLang = state.settings.targetLanguages[0];
        return currentLang 
          ? state.settings.languageVoices[currentLang.code]?.voiceId 
          : undefined;
      },

      addLanguageClass: (code, level, voiceId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            targetLanguages: [
              { code, level },
              ...state.settings.targetLanguages.filter(lang => lang.code !== code)
            ],
            languageVoices: {
              ...state.settings.languageVoices,
              [code]: { voiceId },
            },
          },
        })),

      removeLanguageClass: (code) =>
        set((state) => ({
          settings: {
            ...state.settings,
            targetLanguages: state.settings.targetLanguages.filter(
              lang => lang.code !== code
            ),
            languageVoices: Object.fromEntries(
              Object.entries(state.settings.languageVoices).filter(
                ([key]) => key !== code
              )
            ),
          },
        })),
    }),
    {
      name: 'user-settings',
      version: 1,
      storage: localStorage as any,
    }
  )
);

export function useCurrentLanguageSettings() {
  const currentLanguage = useSettingsStore(state => state.getCurrentLanguage());
  const currentVoice = useSettingsStore(state => state.getCurrentVoice());
  const nativeLanguage = useSettingsStore(state => state.settings.nativeLanguage);

  return {
    currentLanguage,
    currentVoice,
    nativeLanguage,
  };
} 