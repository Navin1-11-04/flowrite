"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditorIntegration, usePageTitle } from "./useEditorIntegration";
import { useWorkspace } from "@/store/useWorkspace";
import { useSession } from "@/store/useSession";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Clock, 
  Save, 
  AlertCircle,
  Type,
  AlignLeft,
  Eye,
  EyeOff,
} from "lucide-react";

interface EditorProps {
  className?: string;
  focusMode?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function Editor({ className, focusMode = false, onFocus, onBlur }: EditorProps) {
  const { currentPage, handleContentChange, isReady } = useEditorIntegration();
  const { updateTitle, currentTitle } = usePageTitle();
  const { 
    workspaces, 
    currentWorkspaceId, 
    createPage,
    isLoading: workspaceLoading 
  } = useWorkspace();
  
  const {
    wordCount,
    charCount,
    isWriting,
    startTime,
    lastSaved,
  } = useSession();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [fontSize, setFontSize] = useState("text-base");
  const [lineHeight, setLineHeight] = useState("leading-relaxed");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync with current page
  useEffect(() => {
    if (currentPage) {
      setContent(currentPage.content);
      setTitle(currentPage.title);
    } else {
      setContent("");
      setTitle("Untitled");
    }
  }, [currentPage]);

  // Handle content changes with debounced saving indicator
  const onContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsSaving(true);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set saving to false after save completes
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 1200);
    
    handleContentChange(newContent, title);
  }, [handleContentChange, title]);

  // Handle title changes
  const onTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    updateTitle(newTitle);
  }, [updateTitle]);

  // Auto-focus on new page creation
  useEffect(() => {
    if (currentPage && !currentPage.content && !currentPage.title.startsWith("Untitled")) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [currentPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Create initial page if needed
  const handleCreateFirstPage = async () => {
    await createPage("My First Page");
  };

  // Format time for session display
  const formatSessionTime = (timestamp: number | null) => {
    if (!timestamp) return "0m";
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format last saved time
  const formatLastSaved = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 10000) return "Just now";
    if (diff < 60000) return "Less than a minute ago";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S to manually save (visual feedback)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 800);
    }
    
    // Ctrl/Cmd + T to focus title
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
    
    // Escape to blur current element
    if (e.key === 'Escape') {
      (e.target as HTMLElement).blur();
    }
  }, []);

  // Enhanced focus/blur handlers that call parent callbacks
  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Only trigger blur if focus is leaving the entire editor container
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        onBlur?.();
      }
    }, 0);
  }, [onBlur]);

  // Show loading state
  if (workspaceLoading) {
    return (
      <div className={cn("flex items-center justify-center min-h-[60vh]", className)}>
        <div className="text-center space-y-3">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no current page and workspace exists
  if (!currentPage && currentWorkspaceId) {
    const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);
    
    return (
      <div className={cn("flex items-center justify-center min-h-[60vh]", className)}>
        <div className="text-center space-y-4 max-w-md">
          <div className="space-y-2">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No page selected</h3>
            <p className="text-sm text-muted-foreground">
              Create your first page in <span className="font-medium">{currentWorkspace?.name}</span> to start writing.
            </p>
          </div>
          
          <Button onClick={handleCreateFirstPage} className="gap-2">
            <FileText className="w-4 h-4" />
            Create First Page
          </Button>
        </div>
      </div>
    );
  }

  // Show error state if no workspace
  if (!currentWorkspaceId) {
    return (
      <div className={cn("flex items-center justify-center min-h-[60vh]", className)}>
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-orange-500" />
          <p className="text-sm text-muted-foreground">No workspace available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("h-full flex flex-col max-w-4xl mx-auto", className)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={-1} // Make container focusable for blur detection
    >
      {/* Editor Header */}
      {!focusMode && (
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              {isSaving ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Save className="w-3 h-3" />
                  Saved {formatLastSaved(lastSaved)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="text-xs gap-1"
            >
              {showStats ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showStats ? "Hide" : "Show"} Stats
            </Button>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div className="py-4">
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={cn(
            "text-2xl md:text-3xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50",
            focusMode && "text-center"
          )}
          placeholder="Untitled"
          maxLength={100}
        />
      </div>

      {/* Content Editor */}
      <div className="flex-1 min-h-0">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className={cn(
            "min-h-full border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none placeholder:text-muted-foreground/50",
            fontSize,
            lineHeight,
            focusMode && "text-center"
          )}
          placeholder="Start writing your story..."
        />
      </div>

      {/* Stats Bar */}
      {showStats && !focusMode && (
        <div className="flex items-center justify-between py-4 border-t border-border/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Type className="w-3 h-3" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <AlignLeft className="w-3 h-3" />
              <span>{charCount} characters</span>
            </div>
            {startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Session: {formatSessionTime(startTime)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isWriting && (
              <Badge variant="secondary" className="text-xs">
                Writing
              </Badge>
            )}
            {currentPage && (
              <span>Last updated: {new Date(currentPage.updatedAt).toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Focus Mode Minimal Stats */}
      {showStats && focusMode && (
        <div className="text-center py-2 text-xs text-muted-foreground">
          {wordCount} words • {charCount} characters
          {startTime && ` • ${formatSessionTime(startTime)}`}
        </div>
      )}
    </div>
  );
}

// Optional: Export a wrapped version with default styling
export function EditorContainer() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <Editor className="h-full" />
    </div>
  );
}