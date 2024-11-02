import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageVoiceSettings {
  voiceId: string;
}

interface UserSettings {
  nativeLanguage: string;
  targetLanguages: Array<{ code: string; level: string }>;
  languageVoices: Record<string, LanguageVoiceSettings>;
}

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set: any) => ({
      settings: {
        nativeLanguage: "en",
        targetLanguages: [{ code: "es", level: "beginner" }],
        languageVoices: {},
      },
      updateSettings: (newSettings: UserSettings) => set({ settings: newSettings }),
    }),
    {
      name: 'user-settings',
    }
  )
); 