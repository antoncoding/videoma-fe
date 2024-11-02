import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOnboardingStore } from "@/store/onboarding";
import { LANGUAGES } from "@/constants/languages";
import { VOICE_PROFILES } from "@/constants/voices";
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { LEVELS, type LevelValue } from "@/constants/levels";
import { useSettingsStore } from '@/store/settings';

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [nativeLanguage, setNativeLanguage] = useState<string>("en");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelValue | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const { updateSettings } = useSettingsStore();
  const { markOnboardingComplete } = useOnboardingStore();
  const router = useRouter();

  const availableLanguages = Object.values(LANGUAGES).filter(
    lang => lang.available && lang.code !== nativeLanguage
  );

  const handleComplete = () => {
    if (!selectedLanguage || !selectedLevel || !selectedTeacher || !nativeLanguage) return;

    updateSettings({
      nativeLanguage,
      targetLanguages: [{ code: selectedLanguage, level: selectedLevel }],
      languageVoices: {
        [selectedLanguage]: { voiceId: selectedTeacher }
      }
    });

    markOnboardingComplete();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-2xl p-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <GraduationCap className="w-12 h-12 mx-auto text-primary" />
                <h1 className="text-3xl font-bold">Welcome to Vidioma</h1>
                <p className="text-muted-foreground">
                  First, let's set your native language
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(LANGUAGES)
                  .filter(lang => lang.available)
                  .map((lang) => (
                    <Card
                      key={lang.code}
                      className={cn(
                        "p-6 cursor-pointer hover:border-primary transition-colors",
                        nativeLanguage === lang.code && "border-primary bg-primary/5"
                      )}
                      onClick={() => setNativeLanguage(lang.code)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{lang.flag}</span>
                        <div>
                          <h3 className="font-semibold">{lang.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {lang.nativeName}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
              <Button
                className="w-full"
                onClick={() => setStep(1)}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Choose a Language to Learn</h2>
                <p className="text-muted-foreground">
                  Select the language you want to start with
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {availableLanguages.map((lang) => (
                  <Card
                    key={lang.code}
                    className={cn(
                      "p-6 cursor-pointer hover:border-primary transition-colors",
                      selectedLanguage === lang.code && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{lang.flag}</span>
                      <div>
                        <h3 className="font-semibold">{lang.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {lang.nativeName}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedLanguage}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && selectedLanguage && selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">What's your level?</h2>
                <p className="text-muted-foreground">
                  This helps us personalize your learning experience
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LEVELS.map((level) => (
                  <Card
                    key={level.value}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors",
                      selectedLevel === level.value && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedLevel(level.value as LevelValue)}
                  >
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  </Card>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedLevel}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && selectedLanguage && selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Choose Your Teacher</h2>
                <p className="text-muted-foreground">
                  Select a voice that will guide you through your learning journey
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {VOICE_PROFILES[selectedLanguage as keyof typeof VOICE_PROFILES]?.map((voice) => (
                  <Card 
                    key={voice.id}
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      selectedTeacher === voice.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedTeacher(voice.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 text-2xl">
                        {voice.gender === 'male' ? '👨‍🏫' : '👩‍🏫'}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{voice.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {voice.personality}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {voice.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedTeacher}
                  onClick={handleComplete}
                >
                  Start Learning
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
} 