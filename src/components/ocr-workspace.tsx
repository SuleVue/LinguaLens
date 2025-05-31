"use client";

import { useEffect } from "react";
import { useSession } from "@/contexts/session-context";
import { useLocalization } from "@/contexts/localization-context";
import { ImageUploader } from "@/components/image-uploader";
import { LanguageSelector } from "@/components/language-selector";
import { EditableTextarea } from "@/components/editable-textarea";
import { ActionButtons } from "@/components/action-buttons";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ScanSearch } from "lucide-react";
import { recognizeText } from "@/lib/ocr";
import type { OcrLanguage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OcrWorkspace() {
  const { activeSessionId, getActiveSession, updateSession, addTextToHistory, undoText, redoText } = useSession();
  const { t } = useLocalization();
  const { toast } = useToast();
  const activeSession = getActiveSession();

  const handleImageUpload = (dataUrl: string, name: string, type: string) => {
    if (activeSession) {
      updateSession(activeSession.id, { 
        imageUrl: dataUrl, 
        imageName: name,
        imageType: type,
        extractedText: "", // Clear previous text
        ocrError: null,
        isLoadingOcr: false,
        textHistory: [''], // Reset history
        historyPointer: 0,
      });
    }
  };

  const handleLanguageSelectionChange = (languages: OcrLanguage[]) => {
    if (activeSession) {
      updateSession(activeSession.id, { selectedOcrLanguages: languages });
    }
  };

  const handleExtractText = async () => {
    if (!activeSession || !activeSession.imageUrl || activeSession.selectedOcrLanguages.length === 0) {
      return;
    }
    updateSession(activeSession.id, { isLoadingOcr: true, ocrError: null });
    try {
      const text = await recognizeText(
        activeSession.imageUrl,
        activeSession.selectedOcrLanguages,
        (progress) => {
          // Optional: update progress in UI if needed
          // console.log(`OCR Progress: ${progress}%`);
        }
      );
      if (text.trim() === "") {
        updateSession(activeSession.id, { extractedText: "", isLoadingOcr: false, ocrError: t("errorNoTextFound"), textHistory: [''], historyPointer: 0 });
      } else {
        updateSession(activeSession.id, { extractedText: text, isLoadingOcr: false, textHistory: [text], historyPointer: 0 });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      updateSession(activeSession.id, { isLoadingOcr: false, ocrError: t("errorOcr") });
      toast({ title: "OCR Error", description: t("errorOcr"), variant: "destructive" });
    }
  };

  const handleTextChange = (newText: string) => {
    if (activeSession) {
      // updateSession(activeSession.id, { extractedText: newText }); // Direct update
      addTextToHistory(activeSession.id, newText); // Update via history
    }
  };

  const handleUndo = () => {
    if (activeSession) undoText(activeSession.id);
  }
  const handleRedo = () => {
    if (activeSession) redoText(activeSession.id);
  }

  if (!activeSessionId || !activeSession) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <ScanSearch size={64} className="text-muted-foreground" />
          <p className="text-xl text-muted-foreground">{t("noActiveSession")}</p>
        </div>
      </div>
    );
  }

  const canExtract = activeSession.imageUrl && activeSession.selectedOcrLanguages.length > 0 && !activeSession.isLoadingOcr;

  return (
    <ScrollArea className="flex-1 h-full">
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-y-auto">
      <ImageUploader
        onImageUpload={handleImageUpload}
        currentImageUrl={activeSession.imageUrl}
        currentImageName={activeSession.imageName}
        disabled={activeSession.isLoadingOcr}
      />

      {activeSession.imageUrl && (
        <LanguageSelector
          selectedLanguages={activeSession.selectedOcrLanguages}
          onSelectionChange={handleLanguageSelectionChange}
          imageDataUrl={activeSession.imageUrl}
          disabled={activeSession.isLoadingOcr}
        />
      )}

      {activeSession.imageUrl && (
        <Button onClick={handleExtractText} disabled={!canExtract} className="w-full md:w-auto self-start">
          {activeSession.isLoadingOcr && <Loader2 size={18} className="mr-2 animate-spin" />}
          {t("extractText")}
        </Button>
      )}

      {activeSession.ocrError && (
        <div className="p-3 bg-destructive/10 text-destructive border border-destructive rounded-md flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{activeSession.ocrError}</p>
        </div>
      )}
      
      <div className="flex-grow flex flex-col min-h-[300px] bg-card rounded-lg shadow-sm">
        <EditableTextarea
          value={activeSession.extractedText}
          onChange={handleTextChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={(activeSession.historyPointer || 0) > 0}
          canRedo={(activeSession.historyPointer || 0) < (activeSession.textHistory?.length || 0) - 1}
          isLoading={activeSession.isLoadingOcr}
          disabled={activeSession.isLoadingOcr}
        />
      </div>
      
      <ActionButtons textToProcess={activeSession.extractedText} disabled={activeSession.isLoadingOcr || !activeSession.extractedText} />
    </div>
    </ScrollArea>
  );
}
