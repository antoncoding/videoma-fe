import type { Metadata } from "next";
import { inter, montserrat } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Vidioma",
  description: "Learn languages through immersive video experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${montserrat.variable} font-sans overflow-x-hidden`} 
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
