import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LevelValue } from '@/constants/levels';

interface TargetLanguage {
  code: string;
  level: LevelValue;
  assistingLanguage?: string;
}

interface LanguageState {
  primaryLanguage: string;
  targetLanguages: TargetLanguage[];
}

interface LanguageStore extends LanguageState {
  setPrimaryLanguage: (code: string) => void;
  updateClass: (code: string, level: LevelValue, assistingLanguage?: string) => void;
  removeClass: (code: string) => void;
  getAssistingLanguage: (code: string) => string;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      primaryLanguage: "en",
      targetLanguages: [],
      
      setPrimaryLanguage: (code) => 
        set({ primaryLanguage: code }),
      
      updateClass: (code, level, assistingLanguage) => 
        set((state) => ({
          targetLanguages: [
            { code, level, assistingLanguage },
            ...state.targetLanguages.filter(lang => lang.code !== code)
          ],
        })),
      
      removeClass: (code) =>
        set((state) => ({
          targetLanguages: state.targetLanguages.filter(lang => lang.code !== code),
        })),

      getAssistingLanguage: (code) => {
        const state = get();
        const targetLang = state.targetLanguages.find(lang => lang.code === code);
        return targetLang?.assistingLanguage || state.primaryLanguage;
      },
    }),
    {
      name: 'language-settings',
    }
  )
); 