import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageVoiceSettings {
  voiceId: string;
}

interface TargetLanguage {
  code: string;
  level: string;
}

interface UserSettings {
  nativeLanguage: string;
  targetLanguages: TargetLanguage[];
  languageVoices: Record<string, LanguageVoiceSettings>;
}

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
  updateLanguageLevel: (languageCode: string, level: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'user-settings',
    }
  )
); 