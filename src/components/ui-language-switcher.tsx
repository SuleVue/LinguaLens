"use client";

import { useLocalization } from "@/contexts/localization-context";
import { availableUiLanguages } from "@/lib/localization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

export function UiLanguageSwitcher() {
  const { language, setLanguage, t } = useLocalization();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto min-w-[120px] text-sm" aria-label={t('selectOcrLanguages')}>
        <div className="flex items-center gap-2">
          <Languages size={16} />
          <SelectValue placeholder={t('selectOcrLanguages')} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {availableUiLanguages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
