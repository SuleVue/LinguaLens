export type OcrLanguage = "eng" | "amh" | "orm" | "tir";
export type AiLanguage = "en" | "am" | "or" | "ti";

export interface Session {
  id: string;
  name: string;
  imageUrl?: string | null;
  imageName?: string | null;
  imageType?: string | null;
  selectedOcrLanguages: OcrLanguage[];
  suggestedAiLanguages: AiLanguage[];
  extractedText: string;
  isLoadingOcr: boolean;
  ocrError?: string | null;
  createdAt: number;
  // For undo/redo
  textHistory: string[];
  historyPointer: number;
}

export type UiLanguage = "en" | "am" | "om" | "ti"; // Using 'om' for Oromifa for consistency in keys

export interface Translations {
  appName: string;
  newSession: string;
  uploadImage: string;
  uploadInstruction: string;
  dragDropOr: string;
  browseFiles: string;
  selectOcrLanguages: string;
  suggestLanguages: string;
  extractText: string;
  extractedText: string;
  textCopied: string;
  copyToClipboard: string;
  downloadTxt: string;
  downloadDocx: string;
  undo: string;
  redo: string;
  characterCount: string;
  wordCount: string;
  noActiveSession: string;
  sessionPrefix: string;
  errorImageLoad: string;
  errorOcr: string;
  errorNoTextFound: string;
  errorTextDownload: string;
  loadingOcr: string;
  loadingSuggestions: string;
  languages: {
    en: string;
    am: string;
    om: string; // Oromifa
    ti: string; // Tigrinya
  };
  ocrLanguages: {
    eng: string; // English
    amh: string; // Amharic
    orm: string; // Oromo
    tir: string; // Tigrinya
  };
  aiSuggested: string;
}

export type TranslationKeys = keyof Translations;
