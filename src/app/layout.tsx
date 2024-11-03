import type { Metadata } from "next";
import { inter, montserrat } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster"
import { RightSidebar } from "@/components/layout/right-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

export const metadata: Metadata = {
  title: "Vidioma",
  description: "Learn languages through immersive video experiences",
};

// This remains a server component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <Providers>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 ml-64">
                <div className="max-w-[1600px] mx-auto px-8">
                  <main className="py-8">{children}</main>
                </div>
              </div>
              <RightSidebar />
            </div>
            <Toaster />
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
