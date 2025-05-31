"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useLocalization } from "@/contexts/localization-context";
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      if (disabled) return;
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
    [onImageUpload, t, disabled]
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
    disabled,
  });

  return (
    <div className="w-full p-4 border border-dashed rounded-lg hover:border-primary transition-colors bg-card shadow-sm">
      {currentImageUrl ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full max-w-md h-64 overflow-hidden rounded-md border">
            <Image src={currentImageUrl} alt={currentImageName || "Uploaded image"} layout="fill" objectFit="contain" data-ai-hint="uploaded document" />
          </div>
          <p className="text-sm text-muted-foreground truncate max-w-xs" title={currentImageName || ""}>{currentImageName || "Uploaded Image"}</p>
          <Button onClick={() => onImageUpload("", "", "")} variant="outline" size="sm" disabled={disabled}>
            {t("uploadImage")} {/* Reuse for "Upload New Image" or similar */}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-8 rounded-md cursor-pointer transition-all text-center
            ${isDragActive ? "bg-accent/10 border-primary" : "bg-muted/20"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">{t("loadingOcr")}</p> {/* Or a specific loading image message */}
            </>
          ) : (
            <>
              <UploadCloud
                className={`h-12 w-12 mb-4 ${
                  isDragActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold mb-1">{t("uploadImage")}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {t("uploadInstruction")}
              </p>
              <p className="text-xs text-muted-foreground mb-2">{t("dragDropOr")}</p>
              <Button type="button" variant="outline" size="sm" disabled={disabled} className="pointer-events-none">
                {t("browseFiles")}
              </Button>
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
