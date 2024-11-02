"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SessionHandler } from "@/components/session-handler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionHandler>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </SessionHandler>
    </SessionProvider>
  );
} 