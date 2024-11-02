"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { VOICE_PROFILES, type VoiceProfile } from "@/constants/voices";
import { 
  GraduationCap, 
  Languages, 
  Plus,
  X,
  ChevronRight,
  Settings2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const LANGUAGES = [
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", flag: "🇫🇷" },
] as const;

const LEVELS = [
  { value: "beginner", label: "Beginner", description: "Just starting out" },
  { value: "intermediate", label: "Intermediate", description: "Can handle basic conversations" },
  { value: "advanced", label: "Advanced", description: "Comfortable with complex topics" },
] as const;

interface LanguageVoiceSettings {
  voiceId: string;
}

interface UserSettings {
  nativeLanguage: string;
  targetLanguages: Array<{ code: string; level: string }>;
  languageVoices: Record<string, LanguageVoiceSettings>;
}

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set: any) => ({
      settings: {
        nativeLanguage: "en",
        targetLanguages: [{ code: "es", level: "beginner" }],
        languageVoices: {},
      },
      updateSettings: (newSettings: UserSettings) => set({ settings: newSettings }),
    }),
    {
      name: 'user-settings',
    }
  )
);

function LanguageCard({ 
  language, 
  level,
  voiceId,
  onUpdate,
  onRemove,
}: { 
  language: string;
  level: string;
  voiceId: string;
  onUpdate: (code: string, level: string, voiceId: string) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const langInfo = LANGUAGES.find(l => l.code === language);
  const levelInfo = LEVELS.find(l => l.value === level);
  const voices = VOICE_PROFILES[language as keyof typeof VOICE_PROFILES] || [];
  const selectedVoice = voices.find(v => v.id === voiceId);

  const [localLevel, setLocalLevel] = useState(level);
  const [localVoiceId, setLocalVoiceId] = useState(voiceId);

  const handleSave = () => {
    onUpdate(language, localLevel, localVoiceId);
    setIsOpen(false);
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
                  <p className="text-sm text-muted-foreground">{levelInfo?.label}</p>
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

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const { toast } = useToast();

  const handleAddLanguage = () => {
    setLocalSettings((prev: UserSettings) => ({
      ...prev,
      targetLanguages: [
        ...prev.targetLanguages,
        { code: LANGUAGES[0].code, level: "beginner" }
      ],
      languageVoices: {
        ...prev.languageVoices,
        [LANGUAGES[0].code]: { voiceId: VOICE_PROFILES[LANGUAGES[0].code][0].id }
      }
    }));
  };

  const handleUpdateLanguage = (index: number, code: string, level: string, voiceId: string) => {
    setLocalSettings((prev: UserSettings) => ({
      ...prev,
      targetLanguages: prev.targetLanguages.map((lang, i) => 
        i === index ? { code, level } : lang
      ),
      languageVoices: {
        ...prev.languageVoices,
        [code]: { voiceId }
      }
    }));
  };

  const handleRemoveLanguage = (index: number) => {
    setLocalSettings((prev: UserSettings) => ({
      ...prev,
      targetLanguages: prev.targetLanguages.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "✨ Settings saved",
      description: "Your class preferences have been updated.",
    });
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
        <Button onClick={handleSave}>Save All Changes</Button>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Native Language</h2>
        <div className="grid grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => (
            <Card
              key={lang.code}
              className={cn(
                "p-4 cursor-pointer hover:border-primary transition-colors",
                localSettings.nativeLanguage === lang.code && "border-primary bg-primary/5"
              )}
              onClick={() => setLocalSettings(prev => ({
                ...prev,
                nativeLanguage: lang.code
              }))}
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
        {localSettings.targetLanguages.map((lang, index) => (
          <LanguageCard
            key={index}
            language={lang.code}
            level={lang.level}
            voiceId={localSettings.languageVoices[lang.code]?.voiceId || ''}
            onUpdate={(code, level, voiceId) => 
              handleUpdateLanguage(index, code, level, voiceId)
            }
            onRemove={() => handleRemoveLanguage(index)}
          />
        ))}

        <Button
          variant="outline"
          className="border-dashed"
          onClick={handleAddLanguage}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Class
        </Button>
      </div>
    </div>
  );
} 