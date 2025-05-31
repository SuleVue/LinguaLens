"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocalization } from "@/contexts/localization-context";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

interface EditableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export function EditableTextarea({
  value,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isLoading = false,
  disabled = false,
}: EditableTextareaProps) {
  const { t } = useLocalization();
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const newText = event.target.value;
    setText(newText);
    onChange(newText); // This will trigger addTextToHistory in parent
  };

  const charCount = useMemo(() => text.length, [text]);
  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);

  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/30 rounded-t-md">
        <div className="flex gap-1">
          <Button
            onClick={onUndo}
            disabled={!canUndo || disabled}
            variant="ghost"
            size="sm"
            aria-label={t("undo")}
          >
            <Undo size={16} className="mr-1" /> {t("undo")}
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo || disabled}
            variant="ghost"
            size="sm"
            aria-label={t("redo")}
          >
            <Redo size={16} className="mr-1" /> {t("redo")}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground space-x-3">
          <span>{t("characterCount")}: {charCount}</span>
          <span>{t("wordCount")}: {wordCount}</span>
        </div>
      </div>
      <Textarea
        value={text}
        onChange={handleTextChange}
        placeholder={isLoading ? t("loadingOcr") : t("extractedText")}
        className="flex-grow resize-none min-h-[200px] lg:min-h-[300px] text-base leading-relaxed rounded-b-md focus:ring-primary"
        disabled={isLoading || disabled}
        aria-label={t("extractedText")}
      />
    </div>
  );
}
