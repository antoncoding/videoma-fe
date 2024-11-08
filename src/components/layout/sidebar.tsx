"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Star, 
  Menu,
  Video,
  ChevronDown,
  ChevronRight,
  Trash2,
  LogOut,
  User,
  Settings,
  Pencil
} from "lucide-react";
import { useState } from "react";
import { useVideosStore } from '@/store/videos';
import { useSession, signOut, signIn } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/contexts/sidebar-context";

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
    title: "Lessons",
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
  const { videos, removeVideo, updateVideo } = useVideosStore();
  const { data: session, status } = useSession();
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { isLeftSidebarVisible, setLeftSidebarVisible } = useSidebar();

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleStartEdit = (videoId: string, currentTitle: string) => {
    setEditingVideoId(videoId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (videoId: string) => {
    if (editingTitle.trim()) {
      updateVideo(videoId, { customTitle: editingTitle.trim() });
    }
    setEditingVideoId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, videoId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(videoId);
    } else if (e.key === 'Escape') {
      setEditingVideoId(null);
      setEditingTitle("");
    }
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        "md:translate-x-0",
        isLeftSidebarVisible ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Vidioma
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("", isCollapsed ? "" : "ml-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col h-[calc(100vh-3.5rem)] justify-between">
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1 px-2">
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
                    <div className="flex items-center w-full">
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {!isCollapsed && <span>{item.title}</span>}
                      </span>
                      {!isCollapsed && (
                        <span className="ml-auto">
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href} className="flex items-center gap-2 w-full">
                      {item.icon}
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  )}
                </Button>
                
                {/* Expandable content */}
                {item.isExpandable && 
                 expandedItems.includes(item.title) && 
                 !isCollapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="group flex items-center gap-2"
                      >
                        {editingVideoId === video.id ? (
                          <div className="flex-1 flex items-center gap-2 pl-6">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, video.id)}
                              onBlur={() => handleSaveEdit(video.id)}
                              autoFocus
                              className="h-8"
                            />
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start pl-6"
                            asChild
                          >
                            <Link href={`/videos/${video.id}`}>
                              <span className="truncate">{video.customTitle}</span>
                            </Link>
                          </Button>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(video.id, video.customTitle);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVideo(video.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full",
                isCollapsed ? "justify-center px-2" : "justify-start"
              )}
              asChild
            >
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Settings</span>}
              </Link>
            </Button>
          </div>

          {status === "authenticated" && session?.user ? (
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed ? "flex-col" : "flex-row",
              "px-2"
            )}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-auto"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className={cn(
                "w-full",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => signIn("google")}
            >
              {isCollapsed ? (
                <User className="h-4 w-4" />
              ) : (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign in
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {isLeftSidebarVisible && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] md:hidden"
          onClick={() => setLeftSidebarVisible(false)}
        />
      )}
    </div>
  );
} 