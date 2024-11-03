import { useLanguageStore } from '@/store/settings/language';
import { useVoiceStore } from '@/store/settings/voice';
import { LevelValue } from '@/constants/levels';
import { VOICE_PROFILES } from '@/constants/voices';

export function useLanguageSettings() {
  const {
    primaryLanguage,
    targetLanguages,
    setPrimaryLanguage,
    updateClass: updateLanguageClass,
    removeClass: removeLanguageClass,
    getAssistingLanguage,
  } = useLanguageStore();

  const {
    voices,
    setVoice,
    removeVoice,
  } = useVoiceStore();

  // Single way to update a class
  const updateClass = (
    code: string,
    level: LevelValue,
    voiceId: string,
    assistingLanguage?: string
  ) => {
    updateLanguageClass(code, level, assistingLanguage);
    setVoice(code, voiceId);
  };

  // Single way to remove a class
  const removeClass = (code: string) => {
    removeLanguageClass(code);
    removeVoice(code);
  };

  const getVoiceForLanguage = (code: string) => {
    return voices[code]?.voiceId || VOICE_PROFILES[code][0].id
  };

  return {
    // Settings
    primaryLanguage,
    targetLanguages,
    setPrimaryLanguage,
    
    // Class operations
    updateClass,
    removeClass,
    classes,
    
    // Queries
    getAssistingLanguage,
    
    // Voice settings
    voices,

    // assistant functions
    getVoiceForLanguage,
  };
} 