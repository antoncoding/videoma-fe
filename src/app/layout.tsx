import type { Metadata } from "next";
import { inter, montserrat } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Learn with Clips",
  description: "Learn languages with YouTube clips",
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
              <main className="p-8">{children}</main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
