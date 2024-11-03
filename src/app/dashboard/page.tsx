"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { VideoSearch } from "@/components/dashboard/video-search";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import { Card } from "@/components/ui/card";
import { LANGUAGES } from "@/constants/languages";
import { VOICE_PROFILES } from "@/constants/voices";
import { cn } from "@/lib/utils";
import type { LearningClass } from "@/store/settings/language";

export default function Dashboard() {
  const { shouldShowOnboarding } = useOnboardingStore();
  const { 
    enrolledClasses, 
    voices, 
    updateClass,
    getCurrentClass,
  } = useLanguageSettings();
  
  // Keep track of current class in local state
  const [activeClassCode, setActiveClassCode] = useState<string>(
    getCurrentClass()?.languageCode ?? 'es'
  );

  // If no classes are enrolled, show onboarding
  if (shouldShowOnboarding()) {
    return <OnboardingFlow />;
  }

  // Update active class when selecting a different class
  const handleClassSelect = (cls: LearningClass) => {
    setActiveClassCode(cls.languageCode);
    updateClass(
      cls.languageCode,
      cls.level,
      voices[cls.languageCode]?.voiceId || '',
      cls.assistingLanguage
    );
  };

  // Get the current active class
  const activeClass = enrolledClasses.find(cls => cls.languageCode === activeClassCode) 
    || getCurrentClass();

  const currentClass = getCurrentClass();
  const currentVoice = currentClass 
    ? VOICE_PROFILES[currentClass.languageCode]?.find(
        v => v.id === voices[currentClass.languageCode]?.voiceId
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
        {enrolledClasses.map((cls: LearningClass) => {
          const language = LANGUAGES[cls.languageCode];
          const voice = VOICE_PROFILES[cls.languageCode]?.find(
            v => v.id === voices[cls.languageCode]?.voiceId
          );

          return (
            <Card
              key={cls.languageCode}
              className={cn(
                "p-6 cursor-pointer hover:border-primary transition-colors",
                activeClass?.languageCode === cls.languageCode && "border-primary bg-primary/5"
              )}
              onClick={() => handleClassSelect(cls)}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{language.flag}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{language.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cls.level.charAt(0).toUpperCase() + cls.level.slice(1)} Level
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
          );
        })}
      </div>

      {activeClass && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Start a {LANGUAGES[activeClass.languageCode].label} Lesson
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentVoice?.name} will help you learn through video content
              </p>
            </div>
          </div>

          <VideoSearch 
            languageCode={activeClass.languageCode}
            level={activeClass.level}
          />
        </div>
      )}
    </div>
  );
}