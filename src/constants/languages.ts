export interface Language {
  code: string;
  label: string;
  flag: string;
  nativeName: string;  // Name in its own language
  available: boolean;  // If it's ready for use
  description?: string;
  canBePrimary: boolean;
}

export const LANGUAGES: Record<string, Language> = {
  es: {
    code: "es",
    label: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    available: true,
    description: "One of the world's most spoken languages",
    canBePrimary: false,
  },
  'zh-TW': {
    code: "zh-TW",
    label: "Traditional Chinese",
    nativeName: "繁體中文",
    flag: "🇹🇼",
    available: true,
    description: "The traditional writing system used in Taiwan and Hong Kong",
    canBePrimary: true,
  },
  fr: {
    code: "fr",
    label: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    available: true,
    description: "A romance language known for its elegance",
    canBePrimary: false,
  },
  en: {
    code: "en",
    label: "English",
    nativeName: "English",
    flag: "🇬🇧",
    available: true,
    description: "The global language of business and technology",
    canBePrimary: true,
  },
  ja: {
    code: "ja",
    label: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    available: true,
    description: "Coming soon!",
    canBePrimary: false,
  },
  ko: {
    code: "ko",
    label: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    available: false,
    description: "Coming soon!",
    canBePrimary: false,
  },
};

export const AVAILABLE_LANGUAGES = Object.values(LANGUAGES).filter(
  lang => lang.available
); 

export const getLanguageEmoji = (langCode: string = 'en') => {
  return LANGUAGES[langCode]?.flag || '🌐';
};