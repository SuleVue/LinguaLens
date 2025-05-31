"use client";

import { useLocalization } from "@/contexts/localization-context";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, FileText, FileArchive, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadTxt, downloadDocx } from "@/lib/download";

interface ActionButtonsProps {
  textToProcess: string;
  disabled?: boolean;
}

export function ActionButtons({ textToProcess, disabled }: ActionButtonsProps) {
  const { t } = useLocalization();
  const { toast } = useToast();

  const handleCopyToClipboard = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(textToProcess);
      toast({
        title: t("textCopied"),
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTxt = () => {
    if (disabled) return;
    try {
      downloadTxt(textToProcess);
    } catch (error) {
      toast({
        title: "Error",
        description: t("errorTextDownload"),
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocx = async () => {
    if (disabled) return;
    try {
      await downloadDocx(textToProcess);
    } catch (error) {
      toast({
        title: "Error",
        description: t("errorTextDownload"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 border-t items-center justify-end bg-card rounded-b-lg shadow-sm">
      <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={!textToProcess || disabled}>
        <ClipboardCopy size={16} className="mr-2" /> {t("copyToClipboard")}
      </Button>
      <Button onClick={handleDownloadTxt} variant="outline" size="sm" disabled={!textToProcess || disabled}>
        <FileText size={16} className="mr-2" /> {t("downloadTxt")}
      </Button>
      <Button onClick={handleDownloadDocx} variant="outline" size="sm" disabled={!textToProcess || disabled}>
        <FileArchive size={16} className="mr-2" /> {t("downloadDocx")}
      </Button>
    </div>
  );
}
