import { useLanguageStore } from '@/store/settings/language';
import { useVoiceStore } from '@/store/settings/voice';
import { LevelValue } from '@/constants/levels';

export function useLanguageSettings() {
  const {
    nativeLanguage,
    targetLanguages,
    setNativeLanguage,
    addTargetLanguage,
    updateLanguageLevel,
    removeTargetLanguage,
    getCurrentLanguage,
  } = useLanguageStore();

  const {
    voices,
    setVoice,
    removeVoice,
    getVoiceForLanguage,
  } = useVoiceStore();

  const updateClass = (code: string, level: LevelValue, voiceId: string) => {
    addTargetLanguage(code, level);
    setVoice(code, voiceId);
  };

  const removeClass = (code: string) => {
    removeTargetLanguage(code);
    removeVoice(code);
  };

  return {
    // Language settings
    nativeLanguage,
    targetLanguages,
    getCurrentLanguage,
    setNativeLanguage,
    updateLanguageLevel,
    
    // Voice settings
    voices,
    getVoiceForLanguage,
    
    // Combined operations
    updateClass,
    removeClass,
  };
} 