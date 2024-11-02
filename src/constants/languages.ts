export interface Language {
  code: string;
  label: string;
  flag: string;
  nativeName: string;  // Name in its own language
  available: boolean;  // If it's ready for use
  description?: string;
}

export const LANGUAGES: Record<string, Language> = {
  es: {
    code: "es",
    label: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    available: true,
    description: "One of the world's most spoken languages",
  },
  zh_tw: {
    code: "zh_tw",
    label: "Traditional Chinese",
    nativeName: "繁體中文",
    flag: "🇹🇼",
    available: true,
    description: "The traditional writing system used in Taiwan and Hong Kong",
  },
  fr: {
    code: "fr",
    label: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    available: true,
    description: "A romance language known for its elegance",
  },
  en: {
    code: "en",
    label: "English",
    nativeName: "English",
    flag: "🇬🇧",
    available: true,
    description: "The global language of business and technology",
  },
  ja: {
    code: "ja",
    label: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    available: true,
    description: "Coming soon!",
  },
  ko: {
    code: "ko",
    label: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    available: false,
    description: "Coming soon!",
  },
};

export const AVAILABLE_LANGUAGES = Object.values(LANGUAGES).filter(
  lang => lang.available
); 