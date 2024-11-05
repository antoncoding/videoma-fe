"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type SidebarContent = ReactNode | null;

interface SidebarContextType {
  rightSidebarContent: SidebarContent;
  showRightSidebar: (content: SidebarContent) => void;
  hideRightSidebar: () => void;
  isRightSidebarVisible: boolean;
  isRightSidebarMinimized: boolean;
  setRightSidebarMinimized: (minimized: boolean) => void;
  isLeftSidebarVisible: boolean;
  setLeftSidebarVisible: (visible: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [rightSidebarContent, setRightSidebarContent] = useState<SidebarContent>(null);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
  const [isRightSidebarMinimized, setIsRightSidebarMinimized] = useState(true);
  const [isLeftSidebarVisible, setLeftSidebarVisible] = useState(false);

  useEffect(() => {
    const handleToggleLeft = () => setLeftSidebarVisible(prev => !prev);
    const handleToggleRight = () => setIsRightSidebarMinimized(prev => !prev);

    window.addEventListener('toggle-left-sidebar', handleToggleLeft);
    window.addEventListener('toggle-right-sidebar', handleToggleRight);

    return () => {
      window.removeEventListener('toggle-left-sidebar', handleToggleLeft);
      window.removeEventListener('toggle-right-sidebar', handleToggleRight);
    };
  }, []);

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
      isLeftSidebarVisible,
      setLeftSidebarVisible,
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