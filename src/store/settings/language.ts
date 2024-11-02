import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LevelValue } from '@/constants/levels';

interface TargetLanguage {
  code: string;
  level: LevelValue;
}

interface LanguageState {
  nativeLanguage: string;
  targetLanguages: TargetLanguage[];
}

interface LanguageStore extends LanguageState {
  setNativeLanguage: (code: string) => void;
  addTargetLanguage: (code: string, level: LevelValue) => void;
  updateLanguageLevel: (code: string, level: LevelValue) => void;
  removeTargetLanguage: (code: string) => void;
  getCurrentLanguage: () => TargetLanguage | undefined;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      nativeLanguage: "en",
      targetLanguages: [],
      
      setNativeLanguage: (code) => set({ nativeLanguage: code }),
      
      addTargetLanguage: (code, level) => 
        set((state) => ({
          targetLanguages: [
            { code, level },
            ...state.targetLanguages.filter(lang => lang.code !== code)
          ],
        })),
      
      updateLanguageLevel: (code, level) =>
        set((state) => ({
          targetLanguages: state.targetLanguages.map(lang =>
            lang.code === code ? { ...lang, level } : lang
          ),
        })),
      
      removeTargetLanguage: (code) =>
        set((state) => ({
          targetLanguages: state.targetLanguages.filter(lang => lang.code !== code),
        })),

      getCurrentLanguage: () => get().targetLanguages[0],
    }),
    {
      name: 'language-settings',
    }
  )
); 