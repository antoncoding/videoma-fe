"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          "px-4 md:px-8",
          "ml-0 md:ml-64",
          "mr-0 md:mr-16 lg:mr-80",
          "transition-all duration-300",
          "pt-14 md:pt-0"
        )}>
          <div className="fixed top-0 left-0 right-0 h-14 border-b bg-background flex items-center justify-between px-4 md:hidden z-50">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => window.dispatchEvent(new CustomEvent('toggle-left-sidebar'))}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">Vidioma</span>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => window.dispatchEvent(new CustomEvent('toggle-right-sidebar'))}>
              <Book className="h-5 w-5" />
            </Button>
          </div>

          <div className="max-w-[1200px] mx-auto">
            <main className="p-8">{children}</main>
          </div>
        </div>
        <RightSidebar />
      </div>
    </SidebarProvider>
  );
} 