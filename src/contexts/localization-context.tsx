"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UiLanguage, Translations, TranslationKeys } from "@/types";
import { translations, availableUiLanguages } from "@/lib/localization";

interface LocalizationContextType {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  t: (key: TranslationKeys, ...args: (string | number)[]) => string;
  currentTranslations: Translations;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<UiLanguage>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem("linguaLens-uiLanguage") as UiLanguage;
    if (storedLang && availableUiLanguages.some(l => l.value === storedLang)) {
      setLanguage(storedLang);
    } else {
      // Basic browser language detection
      const browserLang = navigator.language.split('-')[0] as UiLanguage;
      if (availableUiLanguages.some(l => l.value === browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: UiLanguage) => {
    setLanguage(lang);
    localStorage.setItem("linguaLens-uiLanguage", lang);
  };

  const t = useCallback((key: TranslationKeys, ...args: (string | number)[]) => {
    let translation = translations[language]?.[key] || translations.en[key] || key;
    if (args.length > 0 && typeof translation === 'string') {
      args.forEach((arg, index) => {
        translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
      });
    }
    return String(translation || key); // Ensure string return
  }, [language]);

  const currentTranslations = translations[language] || translations.en;
  
  if (!isMounted) {
    // Avoid hydration mismatch by rendering nothing or a loader on the server/first client render
    return null; 
  }

  return (
    <LocalizationContext.Provider value={{ language, setLanguage: handleSetLanguage, t, currentTranslations }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
};
