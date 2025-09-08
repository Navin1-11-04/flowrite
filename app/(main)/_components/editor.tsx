"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useEditorIntegration, usePageTitle } from "./useEditorIntegration";
import { useWorkspace } from "@/store/useWorkspace";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FileText, AlertCircle, Paperclip } from "lucide-react";
import { Label } from "@/components/ui/label";

interface EditorProps {
  className?: string;
  focusMode?: boolean;
}

const CONTENT_PLACEHOLDERS = [
  "Start writing your story...",
  "Let your thoughts flow...",
  "No distractions, just write...",
  "Capture your ideas...",
  "Write freely, no limits...",
];

export function Editor({ className, focusMode = false }: EditorProps) {
  const { currentPage, handleContentChange } = useEditorIntegration();
  const { updateTitle } = usePageTitle();
  const {
    workspaces,
    currentWorkspaceId,
    createPage,
    isLoading: workspaceLoading,
  } = useWorkspace();

  // State for animated placeholders and content editor
  const [contentPlaceholderIndex, setContentPlaceholderIndex] = useState(0);
  const [contentHasFocus, setContentHasFocus] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  // Refs for DOM manipulation
  const contentEditorRef = useRef<HTMLDivElement | null>(null);
  const contentPlaceholderRef = useRef<HTMLDivElement | null>(null);
  const contentCaretRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-save timeout
  const saveTimeout = useRef<number | null>(null);

  // Sync title with current page
  useEffect(() => {
    if (currentPage) {
      setTitleValue(currentPage.title || "Untitled");

      if (contentEditorRef.current) {
        contentEditorRef.current.textContent = currentPage.content;
        if (contentPlaceholderRef.current) {
          contentPlaceholderRef.current.style.display = currentPage.content
            ? "none"
            : "block";
        }
      }
    } else {
      setTitleValue("Untitled");

      if (contentEditorRef.current) {
        contentEditorRef.current.textContent = "";
        if (contentPlaceholderRef.current) {
          contentPlaceholderRef.current.style.display = "block";
        }
      }
    }
  }, [currentPage?.id]);

  // Animated placeholders for content only
  useEffect(() => {
    if (!contentPlaceholderRef.current || !contentCaretRef.current) return;
    if (
      contentHasFocus ||
      (contentEditorRef.current?.textContent?.length || 0) > 0
    )
      return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to([contentPlaceholderRef.current, contentCaretRef.current], {
      opacity: 0,
      duration: 0.5,
      ease: "power1.inOut",
      onComplete: () =>
        setContentPlaceholderIndex(
          (i) => (i + 1) % CONTENT_PLACEHOLDERS.length
        ),
    }).to([contentPlaceholderRef.current, contentCaretRef.current], {
      opacity: 1,
      duration: 0.5,
      ease: "power1.inOut",
      delay: 0.5,
    });

    return () => {
      tl.kill()
    };
  }, [contentHasFocus]);

  // Update caret position for content editor only
  const updateCaretPosition = (
    editorRef: React.RefObject<HTMLDivElement>,
    caretRef: React.RefObject<HTMLDivElement>,
    hasFocus: boolean
  ) => {
    if (!editorRef.current || !caretRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !hasFocus) {
      caretRef.current.style.opacity = "0";
      return;
    }

    if (!editorRef.current.contains(selection.anchorNode)) {
      caretRef.current.style.opacity = "0";
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(true);

    const span = document.createElement("span");
    span.textContent = "\u200B";
    range.insertNode(span);

    const rect = span.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    const top = rect.top - editorRect.top;
    const left = rect.left - editorRect.left;

    span.parentNode?.removeChild(span);

    caretRef.current.style.top = `${top - 2}px`;
    caretRef.current.style.left = `${left}px`;
    caretRef.current.style.height = `${Math.max(rect.height, 18)}px`;
    caretRef.current.style.opacity = "1";
  };

  // Track selection changes for content editor only
  useEffect(() => {
    const handleSelectionChange = () => {
      if (contentHasFocus)
        updateCaretPosition(contentEditorRef, contentCaretRef, contentHasFocus);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [contentHasFocus]);

  // Debounced save function
  const debouncedSave = useCallback(
    (title: string, content: string) => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
      saveTimeout.current = window.setTimeout(() => {
        handleContentChange(content, title);
        updateTitle(title || "Untitled");
      }, 800);
    },
    [handleContentChange, updateTitle]
  );

  // Handle title input change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitleValue(newTitle);

    const contentText = contentEditorRef.current?.textContent || "";
    debouncedSave(newTitle || "Untitled", contentText);
  };

  // Handle title key events
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      contentEditorRef.current?.focus();
    }
  };

  // Handle content input
  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const contentText = e.currentTarget.textContent || "";
    const titleText = titleValue || "Untitled";

    if (contentPlaceholderRef.current) {
      contentPlaceholderRef.current.style.display =
        contentText.length > 0 ? "none" : "block";
    }

    updateCaretPosition(contentEditorRef, contentCaretRef, contentHasFocus);
    debouncedSave(titleText, contentText);
  };

  // Focus handlers for content editor
  const handleContentFocus = () => {
    setContentHasFocus(true);
    setTimeout(
      () => updateCaretPosition(contentEditorRef, contentCaretRef, true),
      10
    );
  };

  const handleContentBlur = () => {
    setContentHasFocus(false);
    if (contentCaretRef.current) contentCaretRef.current.style.opacity = "0";
  };

  // Auto-focus on new page creation
  useEffect(() => {
    if (currentPage && !currentPage.title && titleInputRef.current) {
      const timer = window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => window.clearTimeout(timer);
    }
  }, [currentPage?.id]);

  // Create initial page if needed
  const handleCreateFirstPage = async () => {
    await createPage("My First Page");
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    };
  }, []);

  // Show loading state
  if (workspaceLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[60vh]",
          className
        )}
      >
        <div className="text-center space-y-3">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no current page and workspace exists
  if (!currentPage && currentWorkspaceId) {
    const currentWorkspace = workspaces.find(
      (ws) => ws.id === currentWorkspaceId
    );

    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[60vh]",
          className
        )}
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="space-y-2">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No page selected</h3>
            <p className="text-sm text-muted-foreground">
              Create your first page in{" "}
              <span className="font-medium">{currentWorkspace?.name}</span> to
              start writing.
            </p>
          </div>

          <button
            onClick={handleCreateFirstPage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Create First Page
          </button>
        </div>
      </div>
    );
  }

  // Show error state if no workspace
  if (!currentWorkspaceId) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[60vh]",
          className
        )}
      >
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-orange-500" />
          <p className="text-sm text-muted-foreground">
            No workspace available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col md:max-w-[60rem] w-full px-6 md:p-0 font-poppins", className)}>
      <div className="w-full flex items-center">
        <Paperclip className="size-5 md:size-7"/>
        <Input
          id="title"
          ref={titleInputRef}
          value={titleValue}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          type="text"
          className={cn(
            "text-xl md:text-2xl bg-background border-none font-semibold shadow-none truncate focus-visible:ring-0 max-w-full md:max-w-[50%] dark:bg-background focus-visible:bg-background"
          )}
        />
      </div>
      <div className="md:max-w-[60rem] w-full h-[1px] md:h-0.5 bg-secondary rounded-full my-2 md:my-5"></div>
      {/* Content Editor */}
      <div className="flex-1 min-h-0 relative w-full">
        <div
          ref={contentPlaceholderRef}
          className="pointer-events-none absolute top-4 md:top-5 left-2 text-primary/50 select-none whitespace-pre-wrap text-xl md:text-2xl font-normal"
        >
          {CONTENT_PLACEHOLDERS[contentPlaceholderIndex]}
        </div>
        <div
          ref={contentEditorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          onBlur={handleContentBlur}
          onFocus={handleContentFocus}
          spellCheck={false}
          className={cn(
            "min-h-full outline-none whitespace-pre-wrap break-words relative z-10 py-4 text-xl md:text-2xl font-normal leading-relaxed",
            focusMode && "text-center"
          )}
          style={{ caretColor: "transparent" }}
        />
        <div
          ref={contentCaretRef}
          className="absolute w-[3px] bg-yellow-400 rounded-sm"
          style={{
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

// Export wrapped version with default styling
export function EditorContainer() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <Editor className="h-full" />
    </div>
  );
}
