import { Card } from "@/components/ui/card";
import { VOICE_PROFILES } from "@/constants/voices";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import { motion } from "framer-motion";
import Image from "next/image";

interface TutorMessageProps {
  language: string;
  message?: string;
  variant?: 'default' | 'lesson';
  title?: string;
}

export function TutorMessage({ 
  language, 
  message,
  variant = 'default',
}: TutorMessageProps) {
  const { getVoiceSettings } = useLanguageSettings();
  const voiceSettings = getVoiceSettings(language);
  const voiceProfile = VOICE_PROFILES[language]?.find(
    v => v.id === voiceSettings?.voiceId
  );

  const defaultMessage = "Hola! Soy tu tutor de idioma. Mira el video y haz clic en cualquier palabra o frase que quieras aprender. ¡Te ayudaré a entenderlas mejor!";
  const tutorMessage = message || defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <Image 
              src={require('@/imgs/tutors/es/jorge.png')}
              alt="Tutor Jorge" 
              width={64} 
              height={64}
              className="rounded-full"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{voiceProfile?.name || 'Your Tutor'}</h3>
            </div>
            {variant === 'default' ? (
              <p className="text-sm text-muted-foreground mt-1">
                {tutorMessage}
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mt-1">
                  {tutorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 