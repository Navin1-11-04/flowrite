import { useCallback, useEffect, useRef } from "react";
import { useWorkspace } from "@/store/useWorkspace";
import { useSession } from "@/store/useSession";

export function useEditorIntegration() {
  const { 
    currentPage, 
    updatePageContent, 
    isLoading 
  } = useWorkspace();
  
  const { 
    updateStats, 
    markSaved, 
    updateWritingStatus, 
    startSession 
  } = useSession();

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isTypingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Start session when component mounts
  useEffect(() => {
    startSession();
  }, [startSession]);

  // Handle content changes with debounced save
  const handleContentChange = useCallback(async (content: string, title?: string) => {
    if (!currentPage) return;

    // Calculate stats
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;

    // Update session stats immediately
    updateStats(wordCount, charCount);
    
    // Mark as typing
    updateWritingStatus(true);
    
    // Clear existing typing timeout
    if (isTypingTimeoutRef.current) {
      clearTimeout(isTypingTimeoutRef.current);
    }

    // Set typing to false after 1 second of no activity
    isTypingTimeoutRef.current = setTimeout(() => {
      updateWritingStatus(false);
    }, 1000);

    // Clear existing save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounced save after 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updatePageContent(currentPage.id, content, title);
        markSaved();
      } catch (error) {
        console.error("Failed to save content:", error);
      }
    }, 500);
  }, [currentPage, updatePageContent, updateStats, markSaved, updateWritingStatus]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (isTypingTimeoutRef.current) {
        clearTimeout(isTypingTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentPage,
    handleContentChange,
    isReady: !isLoading,
  };
}

export function usePageTitle() {
  const { currentPage, updatePageContent } = useWorkspace();
  const updateTitleTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const updateTitle = useCallback((newTitle: string) => {
    if (!currentPage) return;

    // Clear existing timeout
    if (updateTitleTimeoutRef.current) {
      clearTimeout(updateTitleTimeoutRef.current);
    }

    // Debounced title update
    updateTitleTimeoutRef.current = setTimeout(() => {
      updatePageContent(currentPage.id, currentPage.content, newTitle);
    }, 300);
  }, [currentPage, updatePageContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTitleTimeoutRef.current) {
        clearTimeout(updateTitleTimeoutRef.current);
      }
    };
  }, []);

  return {
    updateTitle,
    currentTitle: currentPage?.title || "",
  };
}