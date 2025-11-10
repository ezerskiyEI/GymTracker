import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { languages, Language, TranslationKey } from '@/constants/languages';
import { StorageService } from '@/services/storageService';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  availableLanguages: Array<{ key: Language; name: string; flag: string }>;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<Language>('ru');

  const availableLanguages = [
    { key: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
    { key: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { key: 'by' as Language, name: 'Беларуская', flag: '🇧🇾' }
  ];

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await StorageService.getLanguage();
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await StorageService.saveLanguage(newLanguage);
      setCurrentLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    return languages[language][key] || languages.ru[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}