
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useLocalization } from "@/contexts/localization-context";
import { UploadCloud, Image as ImageIcon, AlertCircle } from "lucide-react"; // Loader2 removed as Progress is used
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUpload: (dataUrl: string, name: string, type: string) => void;
  currentImageUrl?: string | null;
  currentImageName?: string | null;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, currentImageUrl, currentImageName, disabled }: ImageUploaderProps) {
  const { t } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled || isLoading) return;
      setError(null);
      setIsLoading(true);
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onImageUpload(reader.result, file.name, file.type);
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError(t("errorImageLoad"));
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setIsLoading(false);
      }
    },
    [onImageUpload, t, disabled, isLoading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/webp": [".webp"],
    },
    multiple: false,
    disabled: disabled || isLoading,
  });

  return (
    <div className="w-full p-4 border border-dashed rounded-lg hover:border-primary transition-colors bg-card shadow-sm">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <p className="text-muted-foreground font-semibold">{t("processingImage")}</p>
          <Progress value={50} className="w-full max-w-md animate-pulse" />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-md cursor-pointer transition-all text-center
            ${isDragActive ? "bg-accent/10 border-primary-foreground" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${!currentImageUrl ? "p-8 bg-muted/20" : "p-2"}`}
        >
          <input {...getInputProps()} />
          {currentImageUrl ? (
            <>
              <div className="relative w-full max-w-md h-64 overflow-hidden rounded-md border mb-2">
                <Image src={currentImageUrl} alt={currentImageName || "Uploaded image"} layout="fill" objectFit="contain" data-ai-hint="uploaded document" />
              </div>
              <p className="text-sm text-muted-foreground truncate max-w-xs" title={currentImageName || ""}>{currentImageName || "Uploaded Image"}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("clickOrDragToChange")}</p>
            </>
          ) : (
            <>
              <UploadCloud
                className={`h-12 w-12 mb-4 ${
                  isDragActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold mb-1">{t("uploadImage")}</p>
              <p className="text-sm text-muted-foreground">
                {t("uploadInstruction")}
              </p>
            </>
          )}
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-destructive flex items-center">
          <AlertCircle size={16} className="mr-1" /> {error}
        </p>
      )}
    </div>
  );
}
