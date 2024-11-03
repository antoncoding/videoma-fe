import { Card } from "@/components/ui/card";
import { VOICE_PROFILES } from "@/constants/voices";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import { motion } from "framer-motion";

interface TutorMessageProps {
  language: string;
  message?: string;
}

export function TutorMessage({ language, message }: TutorMessageProps) {
  const { getVoiceSettings } = useLanguageSettings();
  const voiceSettings = getVoiceSettings(language);
  const voiceProfile = VOICE_PROFILES[language]?.find(
    v => v.id === voiceSettings?.voiceId
  );

  const defaultMessage = "Hi! I'm your language tutor. Watch the video and click on any words or sentences you'd like to learn. I'll help you understand them better!";
  const tutorMessage = message || defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">
            {voiceProfile?.gender === 'male' ? '👨‍🏫' : '👩‍🏫'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{voiceProfile?.name || 'Your Tutor'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {tutorMessage}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 