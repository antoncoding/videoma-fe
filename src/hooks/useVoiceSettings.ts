import { useSettingsStore } from "@/app/settings/page";
import { VOICE_PROFILES } from "@/constants/voices";

export function useVoiceSettings() {
  const { settings } = useSettingsStore();

  const getVoiceForLanguage = (language: string) => {
    const languageSettings = settings.languageVoices[language];
    if (!languageSettings) return null;

    const voices = VOICE_PROFILES[language as keyof typeof VOICE_PROFILES];
    return voices?.find(v => v.id === languageSettings.voiceId) || null;
  };

  return {
    getVoiceForLanguage,
  };
} 