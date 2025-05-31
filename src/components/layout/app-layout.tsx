"use client";

import { useLocalization } from "@/contexts/localization-context";
import { UiLanguageSwitcher } from "@/components/ui-language-switcher";
import { SessionManager } from "@/components/session-manager";
import { OcrWorkspace } from "@/components/ocr-workspace";
import { Separator } from "@/components/ui/separator";
import { ScanText } from 'lucide-react';


export function AppLayout() {
  const { t } = useLocalization();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border shadow-md">
        <div className="flex items-center gap-2">
          <ScanText size={28} className="text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-primary">{t("appName")}</h1>
        </div>
        <UiLanguageSwitcher />
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="w-full flex flex-col md:flex-row">
          <SessionManager />
          <Separator orientation="vertical" className="hidden md:block h-auto mx-0" />
          <Separator orientation="horizontal" className="block md:hidden w-auto my-0" />
          <OcrWorkspace />
        </div>
      </main>
    </div>
  );
}
