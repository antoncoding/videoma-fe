"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
  onUpdate: (code: string, level: LevelValue, voiceId: string) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localLevel, setLocalLevel] = useState(level);
  const [localVoiceId, setLocalVoiceId] = useState(voiceId);
  const { toast } = useToast();

  const langInfo = LANGUAGES[language];
  const voices = VOICE_PROFILES[language as keyof typeof VOICE_PROFILES] || [];
  const selectedVoice = voices.find(v => v.id === voiceId);

  const handleSave = () => {
    onUpdate(language, localLevel, localVoiceId);
    setIsOpen(false);
    toast({
      title: "✨ Class updated",
      description: "Your class settings have been saved.",
    });
  };

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
              <Button onClick={handleSave}>
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
      // Reset selections
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
    nativeLanguage,
    targetLanguages,
    setNativeLanguage,
    updateClass,
    removeClass,
    voices,
  } = useLanguageSettings();
  const { toast } = useToast();

  const handleUpdateClass = (code: string, level: LevelValue, voiceId: string) => {
    updateClass(code, level, voiceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-muted-foreground">
            Manage your language learning journey
          </p>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Native Language</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.values(LANGUAGES)
            .filter(lang => lang.available)
            .map((lang) => (
              <Card
                key={lang.code}
                className={cn(
                  "p-4 cursor-pointer hover:border-primary transition-colors",
                  nativeLanguage === lang.code && "border-primary bg-primary/5"
                )}
                onClick={() => setNativeLanguage(lang.code)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium">{lang.label}</p>
                    <p className="text-sm text-muted-foreground">Native</p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </Card>

      <div className="grid gap-6">
        {targetLanguages.map((lang) => (
          <LanguageCard
            key={lang.code}
            language={lang.code}
            level={lang.level}
            voiceId={voices[lang.code]?.voiceId || ''}
            onUpdate={handleUpdateClass}
            onRemove={() => removeClass(lang.code)}
          />
        ))}

        <AddClassDialog 
          onAdd={handleUpdateClass}
          existingLanguages={targetLanguages.map(lang => lang.code)}
        />
      </div>
    </div>
  );
} 