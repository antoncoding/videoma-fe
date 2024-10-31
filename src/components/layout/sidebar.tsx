"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  BookOpen, 
  Star, 
  Menu,
  Video,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useVideosStore } from '@/store/videos';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  isExpandable?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: <Home className="w-4 h-4" />,
  },
  {
    title: "Videos",
    href: "/videos",
    icon: <Video className="w-4 h-4" />,
    isExpandable: true,
  },
  {
    title: "Saved",
    href: "/saved",
    icon: <Star className="w-4 h-4" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { videos } = useVideosStore();

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="space-y-1 p-2">
          {navItems.map((item) => (
            <div key={item.title}>
              <Button
                asChild={!item.isExpandable}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center"
                )}
                onClick={() => item.isExpandable && toggleExpand(item.title)}
              >
                {item.isExpandable ? (
                  <div className="flex items-center">
                    {item.icon}
                    {!isCollapsed && (
                      <>
                        <span className="ml-2">{item.title}</span>
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Link href={item.href} className="flex items-center">
                    {item.icon}
                    {!isCollapsed && <span className="ml-2">{item.title}</span>}
                  </Link>
                )}
              </Button>
              
              {/* Expandable content */}
              {item.isExpandable && 
               expandedItems.includes(item.title) && 
               !isCollapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {videos.map((video) => (
                    <Button
                      key={video.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start pl-6"
                      asChild
                    >
                      <Link href={`/videos/${video.id}`}>
                        <span className="truncate">{video.title}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 