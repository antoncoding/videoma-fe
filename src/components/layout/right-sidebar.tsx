"use client";

import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function RightSidebar() {
  const { 
    rightSidebarContent, 
    isRightSidebarVisible, 
    hideRightSidebar, 
    isRightSidebarMinimized,
    setRightSidebarMinimized
  } = useSidebar();

  // Handle responsive states
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setRightSidebarMinimized(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setRightSidebarMinimized]);

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen transition-all duration-300 z-40",
      isRightSidebarMinimized ? "w-16" : "w-full md:w-80",
      "bg-background border-l"
    )}>
      {isRightSidebarMinimized ? (
        // Minimized state
        <div className="flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setRightSidebarMinimized(false)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Expanded state
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Customize your learning</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden" // Only show on mobile
                onClick={hideRightSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="hidden md:inline-flex" // Only show on desktop
                onClick={hideRightSidebar}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {rightSidebarContent}
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {!isRightSidebarMinimized && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] md:hidden"
          onClick={hideRightSidebar}
        />
      )}
    </div>
  );
} 