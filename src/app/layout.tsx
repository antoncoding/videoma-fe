import type { Metadata } from "next";
import { inter, montserrat } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/layout/sidebar";
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
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64">
              <div className="max-w-[1200px] mx-auto px-8">
                <main className="py-8">{children}</main>
              </div>
            </div>
            <div className="w-64 shrink-0" />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
