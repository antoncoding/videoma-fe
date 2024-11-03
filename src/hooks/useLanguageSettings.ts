import { useLanguageStore } from '@/store/settings/language';
import { useVoiceStore } from '@/store/settings/voice';
import { LevelValue } from '@/constants/levels';

export function useLanguageSettings() {
  const {
    primaryLanguage,
    enrolledClasses,
    setPrimaryLanguage,
    enrollInClass,
    updateClassSettings,
    dropClass,
    getCurrentClass,
    getAssistingLanguage,
  } = useLanguageStore();

  const {
    voices,
    setVoice,
    removeVoice,
  } = useVoiceStore();

  // For updating existing class
  const updateClass = (
    languageCode: string,
    level: LevelValue,
    voiceId: string,
    assistingLanguage?: string
  ) => {
    updateClassSettings(languageCode, level, assistingLanguage);
    setVoice(languageCode, voiceId);
  };

  // For adding new class
  const startNewClass = (
    languageCode: string,
    level: LevelValue,
    voiceId: string,
    assistingLanguage?: string
  ) => {
    enrollInClass(languageCode, level, assistingLanguage);
    setVoice(languageCode, voiceId);
  };

  const removeClass = (languageCode: string) => {
    dropClass(languageCode);
    removeVoice(languageCode);
  };

  return {
    // Settings
    primaryLanguage,
    enrolledClasses,
    setPrimaryLanguage,
    
    // Class operations
    updateClass,
    startNewClass,
    removeClass,
    
    // Queries
    getCurrentClass,
    getAssistingLanguage,
    
    // Voice settings
    voices,
  };
} 