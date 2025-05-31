"use client";

import { useState, useEffect } from "react";
import { useLocalization } from "@/contexts/localization-context";
import { availableOcrLanguages, aiLanguageToOcrLanguageMap, ocrLanguageToAiLanguageMap } from "@/lib/localization";
import type { OcrLanguage, AiLanguage } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { suggestLanguage, SuggestLanguageInput } from "@/ai/flows/suggest-language";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface LanguageSelectorProps {
  selectedLanguages: OcrLanguage[];
  onSelectionChange: (languages: OcrLanguage[]) => void;
  imageDataUrl?: string | null;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedLanguages,
  onSelectionChange,
  imageDataUrl,
  disabled,
}: LanguageSelectorProps) {
  const { t, currentTranslations } = useLocalization();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestedOcrLangs, setAiSuggestedOcrLangs] = useState<OcrLanguage[]>([]);

  const handleCheckboxChange = (language: OcrLanguage, checked: boolean) => {
    if (disabled) return;
    const newSelection = checked
      ? [...selectedLanguages, language]
      : selectedLanguages.filter((lang) => lang !== language);
    onSelectionChange(newSelection);
  };

  const handleSuggestLanguages = async () => {
    if (!imageDataUrl || disabled) return;
    setIsSuggesting(true);
    setAiSuggestedOcrLangs([]);
    try {
      const input: SuggestLanguageInput = { photoDataUri: imageDataUrl };
      const result = await suggestLanguage(input);
      if (result && result.suggestedLanguages) {
        const suggestedOcr = result.suggestedLanguages
            .map(aiLang => aiLanguageToOcrLanguageMap[aiLang as AiLanguage])
            .filter(Boolean) as OcrLanguage[];
        
        onSelectionChange(suggestedOcr); // Auto-select based on AI suggestion
        setAiSuggestedOcrLangs(suggestedOcr);

        toast({
          title: t("suggestLanguages"),
          description: `${t("aiSuggested")}: ${suggestedOcr.map(lang => currentTranslations.ocrLanguages[lang]).join(', ')}`,
        });
      }
    } catch (error) {
      console.error("Error suggesting languages:", error);
      toast({
        title: "Error",
        description: "Failed to get AI language suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("selectOcrLanguages")}</h3>
        <Button
          onClick={handleSuggestLanguages}
          variant="outline"
          size="sm"
          disabled={!imageDataUrl || isSuggesting || disabled}
        >
          {isSuggesting ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Sparkles size={16} className="mr-2" />
          )}
          {t("suggestLanguages")}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {availableOcrLanguages.map((lang) => (
          <div key={lang.value} className="flex items-center space-x-2">
            <Checkbox
              id={`ocr-lang-${lang.value}`}
              checked={selectedLanguages.includes(lang.value)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(lang.value, !!checked)
              }
              disabled={disabled}
            />
            <Label htmlFor={`ocr-lang-${lang.value}`} className="flex items-center gap-2 text-sm font-normal cursor-pointer">
              {currentTranslations.ocrLanguages[lang.labelKey]}
              {aiSuggestedOcrLangs.includes(lang.value) && <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-primary text-primary">{t('aiSuggested')}</Badge>}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
