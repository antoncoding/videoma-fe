"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { VideoSearch } from "@/components/dashboard/video-search";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import { Card } from "@/components/ui/card";
import { LANGUAGES } from "@/constants/languages";
import { VOICE_PROFILES } from "@/constants/voices";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { hasCompletedOnboarding } = useOnboardingStore();
  const { 
    targetLanguages, 
    voices, 
    updateClass,
    getCurrentLanguage 
  } = useLanguageSettings();
  const router = useRouter();

  // Show onboarding for new users
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  const currentClass = getCurrentLanguage();
  const currentVoice = currentClass 
    ? VOICE_PROFILES[currentClass.code]?.find(
        v => v.id === voices[currentClass.code]?.voiceId
      )
    : null;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Choose your class to start learning
        </p>
      </div>

      {/* Class Selection */}
      <div className="grid grid-cols-2 gap-6">
        {targetLanguages.map((lang) => {
          const language = LANGUAGES[lang.code];
          const voice = VOICE_PROFILES[lang.code]?.find(
            v => v.id === voices[lang.code]?.voiceId
          );

          return (
            <Card
              key={lang.code}
              className={cn(
                "p-6 cursor-pointer hover:border-primary transition-colors",
                currentClass?.code === lang.code && "border-primary bg-primary/5"
              )}
              onClick={() => updateClass(
                lang.code,
                lang.level,
                voices[lang.code]?.voiceId || ''
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{language.flag}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{language.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lang.level.charAt(0).toUpperCase() + lang.level.slice(1)} Level
                    </p>
                  </div>
                </div>
                {voice && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{voice.gender === 'male' ? '👨‍🏫' : '👩‍🏫'}</span>
                    <span>Learning with {voice.name}</span>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {currentClass && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Start a {LANGUAGES[currentClass.code].label} Lesson
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentVoice?.name} will help you learn through video content
              </p>
            </div>
          </div>

          <VideoSearch 
            language={currentClass.code}
            level={currentClass.level}
          />
        </div>
      )}
    </div>
  );
} 