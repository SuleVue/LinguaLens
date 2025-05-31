"use client"; // Top-level client component for providers

import { LocalizationProvider } from "@/contexts/localization-context";
import { SessionProvider } from "@/contexts/session-context";
import { AppLayout } from "@/components/layout/app-layout";

export default function Home() {
  return (
    <LocalizationProvider>
      <SessionProvider>
        <AppLayout />
      </SessionProvider>
    </LocalizationProvider>
  );
}
