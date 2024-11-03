"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

type SidebarContent = ReactNode | null;

interface SidebarContextType {
  rightSidebarContent: SidebarContent;
  showRightSidebar: (content: SidebarContent) => void;
  hideRightSidebar: () => void;
  isRightSidebarVisible: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [rightSidebarContent, setRightSidebarContent] = useState<SidebarContent>(null);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);

  const showRightSidebar = (content: SidebarContent) => {
    setRightSidebarContent(content);
    setIsRightSidebarVisible(true);
  };

  const hideRightSidebar = () => {
    setIsRightSidebarVisible(false);
  };

  return (
    <SidebarContext.Provider value={{
      rightSidebarContent,
      showRightSidebar,
      hideRightSidebar,
      isRightSidebarVisible,
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