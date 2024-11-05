"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className={cn(
          "flex-1",
          "ml-0 md:ml-64",
          "mr-0 md:mr-16 lg:mr-80",
          "transition-all duration-300"
        )}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <main className="py-8">{children}</main>
          </div>
        </div>
        <RightSidebar />
      </div>
    </SidebarProvider>
  );
} 