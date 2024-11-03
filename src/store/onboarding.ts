import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useLanguageStore } from './settings/language';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
  shouldShowOnboarding: () => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      markOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      shouldShowOnboarding: () => {
        const { hasCompletedOnboarding } = get();
        const { enrolledClasses } = useLanguageStore.getState();
        return !hasCompletedOnboarding || enrolledClasses.length === 0;
      },
    }),
    {
      name: 'onboarding-status',
    }
  )
); 