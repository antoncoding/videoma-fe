"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { useEffect, useState } from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  // Use client-side only rendering for layout calculations
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 mr-80">
          <div className="max-w-[1200px] mx-auto px-8">
            <main className="py-8">{children}</main>
          </div>
        </div>
        <RightSidebar />
      </div>
    </SidebarProvider>
  );
} 