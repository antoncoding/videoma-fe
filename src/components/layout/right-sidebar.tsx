"use client";

import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function RightSidebar() {
  const { 
    rightSidebarContent, 
    hideRightSidebar, 
    isRightSidebarMinimized,
    setRightSidebarMinimized
  } = useSidebar();

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen transition-all duration-300 z-40",
      isRightSidebarMinimized ? "w-16 translate-x-full md:translate-x-0" : "w-full md:w-80",
      "bg-background border-l",
      "mt-14 md:mt-0"
    )}>
      {isRightSidebarMinimized ? (
        <div className="hidden md:flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setRightSidebarMinimized(false)}
          >
            <Book className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Learning Progress</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={hideRightSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
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