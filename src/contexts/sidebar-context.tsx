"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

type SidebarContent = ReactNode | null;

interface SidebarContextType {
  rightSidebarContent: SidebarContent;
  showRightSidebar: (content: SidebarContent) => void;
  hideRightSidebar: () => void;
  isRightSidebarVisible: boolean;
  isRightSidebarMinimized: boolean;
  setRightSidebarMinimized: (minimized: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [rightSidebarContent, setRightSidebarContent] = useState<SidebarContent>(null);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
  const [isRightSidebarMinimized, setIsRightSidebarMinimized] = useState(true);

  const showRightSidebar = (content: SidebarContent) => {
    setRightSidebarContent(content);
    setIsRightSidebarVisible(true);
    setIsRightSidebarMinimized(false);
  };

  const hideRightSidebar = () => {
    setIsRightSidebarMinimized(true);
  };

  return (
    <SidebarContext.Provider value={{
      rightSidebarContent,
      showRightSidebar,
      hideRightSidebar,
      isRightSidebarVisible,
      isRightSidebarMinimized,
      setRightSidebarMinimized: setIsRightSidebarMinimized,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}; 