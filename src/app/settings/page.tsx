"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/constants/languages";
import { LEVELS, type LevelValue } from "@/constants/levels";
import { VOICE_PROFILES } from "@/constants/voices";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStore } from "@/store/onboarding";
import { useRouter } from "next/navigation";

function LanguageCard({ 
  language, 
  level,
  voiceId,
  onUpdate,
  onRemove,
}: { 
  language: string;
  level: LevelValue;
  voiceId: string;
  onUpdate: (code: string, level: LevelValue, voiceId: string, preferredLanguage?: string) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localLevel, setLocalLevel] = useState(level);
  const [localVoiceId, setLocalVoiceId] = useState(voiceId);
  const [localPreferredLanguage, setLocalPreferredLanguage] = useState<string | undefined>();
  const { primaryLanguage } = useLanguageSettings();
  const { toast } = useToast();

  const langInfo = LANGUAGES[language];
  const voices = VOICE_PROFILES[language as keyof typeof VOICE_PROFILES] || [];
  const selectedVoice = voices.find(v => v.id === voiceId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Card className="relative group">
        <DialogTrigger asChild>
          <div className="p-6 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{langInfo?.flag}</div>
                <div>
                  <h3 className="text-xl font-semibold">{langInfo?.label}</h3>
                  <p className="text-sm text-muted-foreground">{LEVELS.find(l => l.value === level)?.label}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
            {selectedVoice && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedVoice.gender === 'male' ? '👨‍🏫' : '👩‍🏫'}</span>
                <span>Learning with {selectedVoice.name}</span>
              </div>
            )}
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Class Settings: {langInfo?.label}</DialogTitle>
            <DialogDescription>
              Customize your learning experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium">Your Level</h4>
              <div className="grid grid-cols-3 gap-4">
                {LEVELS.map((l) => (
                  <Card
                    key={l.value}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors",
                      localLevel === l.value && "border-primary bg-primary/5"
                    )}
                    onClick={() => setLocalLevel(l.value)}
                  >
                    <h3 className="font-semibold">{l.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {l.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Choose Your Teacher</h4>
              <div className="grid grid-cols-2 gap-4">
                {voices.map((voice) => (
                  <Card 
                    key={voice.id}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors",
                      localVoiceId === voice.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setLocalVoiceId(voice.id)}
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
            </div>

            {/* Learning Language Preference */}
            <div className="space-y-4">
              <h4 className="font-medium">Assisting Language</h4>
              <p className="text-sm text-muted-foreground">
                Choose which language you want to assist your learning of {LANGUAGES[language].label}.
                By default, translations will be in your primary language ({LANGUAGES[primaryLanguage].label}).
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { code: "en", label: "English" },
                  { code: "zh-TW", label: "Traditional Chinese" }
                ].filter(lang => lang.code !== language).map((lang) => (
                  <Card
                    key={lang.code}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors",
                      localPreferredLanguage === lang.code && "border-primary bg-primary/5"
                    )}
                    onClick={() => setLocalPreferredLanguage(lang.code)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{LANGUAGES[lang.code].flag}</span>
                      <div>
                        <p className="font-medium">{lang.label}</p>
                        {lang.code === primaryLanguage && (
                          <Badge variant="secondary" className="mt-1">
                            Primary Language
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={onRemove}
            >
              Drop Class
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onUpdate(language, localLevel, localVoiceId, localPreferredLanguage);
                setIsOpen(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Card>
    </Dialog>
  );
}

interface AddClassDialogProps {
  onAdd: (code: string, level: LevelValue, voiceId: string) => void;
  existingLanguages: string[];
}

function AddClassDialog({ onAdd, existingLanguages }: AddClassDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelValue>("beginner");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const availableLanguages = Object.values(LANGUAGES).filter(
    lang => lang.available && !existingLanguages.includes(lang.code)
  );

  const voices = selectedLanguage 
    ? VOICE_PROFILES[selectedLanguage as keyof typeof VOICE_PROFILES] || []
    : [];

  const handleAdd = () => {
    if (selectedLanguage && selectedLevel && selectedVoice) {
      onAdd(selectedLanguage, selectedLevel, selectedVoice);
      setIsOpen(false);
      setSelectedLanguage(null);
      setSelectedLevel("beginner");
      setSelectedVoice(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed">
          Add New Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a New Language Class</DialogTitle>
          <DialogDescription>
            Choose a language and your starting level
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">Choose Language</h4>
            <div className="grid grid-cols-2 gap-4">
              {availableLanguages.map((lang) => (
                <Card
                  key={lang.code}
                  className={cn(
                    "p-4 cursor-pointer hover:border-primary transition-colors",
                    selectedLanguage === lang.code && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setSelectedVoice(null); // Reset voice when language changes
                  }}
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
          </div>

          {/* Level Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">Choose Level</h4>
            <div className="grid grid-cols-3 gap-4">
              {LEVELS.map((level) => (
                <Card
                  key={level.value}
                  className={cn(
                    "p-4 cursor-pointer hover:border-primary transition-colors",
                    selectedLevel === level.value && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedLevel(level.value)}
                >
                  <h3 className="font-semibold">{level.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {level.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Teacher Selection */}
          {selectedLanguage && (
            <div className="space-y-4">
              <h4 className="font-medium">Choose Your Teacher</h4>
              <div className="grid grid-cols-2 gap-4">
                {voices.map((voice) => (
                  <Card 
                    key={voice.id}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors",
                      selectedVoice === voice.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedVoice(voice.id)}
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedLanguage || !selectedLevel || !selectedVoice}
          >
            Add Class
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const {
    primaryLanguage,
    enrolledClasses,
    setPrimaryLanguage,
    updateClass,
    startNewClass,
    removeClass,
    voices,
  } = useLanguageSettings();
  const { toast } = useToast();
  const { shouldShowOnboarding } = useOnboardingStore();
  const router = useRouter();

  // Redirect to onboarding if no classes are enrolled
  useEffect(() => {
    if (shouldShowOnboarding()) {
      router.push('/dashboard');
    }
  }, [shouldShowOnboarding, router]);

  const handleUpdateClass = (
    languageCode: string, 
    level: LevelValue, 
    voiceId: string, 
    assistingLanguage?: string
  ) => {
    updateClass(languageCode, level, voiceId, assistingLanguage);
    toast({
      title: "✨ Class updated",
      description: assistingLanguage 
        ? `Now learning ${LANGUAGES[languageCode].label} with ${LANGUAGES[assistingLanguage].label}`
        : `Updated ${LANGUAGES[languageCode].label} class settings`,
    });
  };

  const handleAddClass = (
    languageCode: string,
    level: LevelValue,
    voiceId: string
  ) => {
    startNewClass(languageCode, level, voiceId, primaryLanguage);
    toast({
      title: "✨ New class added",
      description: `Started learning ${LANGUAGES[languageCode].label}!`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Language Settings</h1>
          <p className="text-muted-foreground">
            Customize your learning experience
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Primary Learning Language</h2>
            <p className="text-sm text-muted-foreground">
              This is the language you're most comfortable with. All translations will default 
              to this language unless specified otherwise in individual class settings.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { code: "en", label: "English" },
              { code: "zh-TW", label: "Traditional Chinese" }
            ].map((lang) => (
              <Card
                key={lang.code}
                className={cn(
                  "p-6 cursor-pointer hover:border-primary transition-colors",
                  primaryLanguage === lang.code && "border-primary bg-primary/5"
                )}
                onClick={() => setPrimaryLanguage(lang.code)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{LANGUAGES[lang.code].flag}</span>
                  <div>
                    <h3 className="font-semibold">{lang.label}</h3>
                    {primaryLanguage === lang.code && (
                      <Badge variant="secondary" className="mt-1">
                        Currently your primary language
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">My Language Classes</h2>
          <p className="text-sm text-muted-foreground">
            Languages you're currently learning. Each class can be customized with a teacher 
            and an assisting language for translations.
          </p>
        </div>

        <div className="grid gap-6">
          {enrolledClasses.map((cls) => (
            <LanguageCard
              key={cls.languageCode}
              language={cls.languageCode}
              level={cls.level}
              voiceId={voices[cls.languageCode]?.voiceId || ''}
              onUpdate={handleUpdateClass}
              onRemove={() => removeClass(cls.languageCode)}
            />
          ))}

          <AddClassDialog 
            onAdd={handleAddClass}
            existingLanguages={enrolledClasses.map(cls => cls.languageCode)}
          />
        </div>
      </div>
    </div>
  );
} 