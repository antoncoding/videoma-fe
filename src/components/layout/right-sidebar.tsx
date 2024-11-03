"use client";

import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RightSidebar() {
  const { rightSidebarContent, isRightSidebarVisible, hideRightSidebar } = useSidebar();

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-screen w-80 bg-background border-l transform transition-transform duration-300 ease-in-out",
        isRightSidebarVisible ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Customize your learning</h2>
          <Button variant="ghost" size="icon" onClick={hideRightSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          {rightSidebarContent}
        </div>
      </div>
    </div>
  );
} 