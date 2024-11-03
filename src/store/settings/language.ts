import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LevelValue } from '@/constants/levels';

export interface LearningClass {
  languageCode: string;
  level: LevelValue;
  assistingLanguage?: string;
}

interface LanguageState {
  primaryLanguage: string;
  enrolledClasses: LearningClass[];
}

interface LanguageStore extends LanguageState {
  setPrimaryLanguage: (code: string) => void;
  enrollInClass: (languageCode: string, level: LevelValue, assistingLanguage?: string) => void;
  updateClassSettings: (languageCode: string, level: LevelValue, assistingLanguage?: string) => void;
  dropClass: (languageCode: string) => void;
  getCurrentClass: () => LearningClass | undefined;
  getAssistingLanguage: (languageCode: string) => string;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      primaryLanguage: "en",
      enrolledClasses: [
        {
          languageCode: "es",
          level: "beginner",
          assistingLanguage: "en"
        }
      ],
      
      setPrimaryLanguage: (code) => 
        set((state) => ({
          ...state,
          primaryLanguage: code
        })),
      
      enrollInClass: (languageCode, level, assistingLanguage) => 
        set((state) => {
          const newClass = { languageCode, level, assistingLanguage };
          const existingIndex = state.enrolledClasses.findIndex(
            cls => cls.languageCode === languageCode
          );

          const updatedClasses = existingIndex >= 0
            ? [
                newClass,
                ...state.enrolledClasses.slice(0, existingIndex),
                ...state.enrolledClasses.slice(existingIndex + 1)
              ]
            : [newClass, ...state.enrolledClasses];

          return {
            ...state,
            enrolledClasses: updatedClasses
          };
        }),
      
      updateClassSettings: (languageCode, level, assistingLanguage) =>
        set((state) => ({
          ...state,
          enrolledClasses: state.enrolledClasses.map(cls =>
            cls.languageCode === languageCode 
              ? { ...cls, level, assistingLanguage }
              : cls
          )
        })),
      
      dropClass: (languageCode) =>
        set((state) => ({
          ...state,
          enrolledClasses: state.enrolledClasses.filter(
            cls => cls.languageCode !== languageCode
          )
        })),

      getCurrentClass: () => get().enrolledClasses[0],

      getAssistingLanguage: (languageCode) => {
        const state = get();
        const cls = state.enrolledClasses.find(c => c.languageCode === languageCode);
        return cls?.assistingLanguage || state.primaryLanguage;
      },
    }),
    {
      name: 'language-settings-v2',
      version: 1,
    }
  )
); 