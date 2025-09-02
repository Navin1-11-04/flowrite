"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useSession } from "@/store/useSession";
import { openDB, saveToDB, getFromDB } from "@/lib/indexedDB";

type EditorProps = {
  onFocus?: () => void;
  onBlur?: () => void;
};

const PLACEHOLDERS = [
  "Start writing here...",
  "Let your thoughts flow...",
  "No distractions, just write...",
  "Capture your ideas...",
  "Write freely, no limits...",
];

const DB_NAME = "freewriteDB";
const STORE_NAME = "documents";
const DOC_KEY = "currentDoc";

export function Editor({ onFocus, onBlur }: EditorProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const caretRef = useRef<HTMLDivElement | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const { setWriting, setWordCount, setCharCount, setLastSaved } = useSession();

  // Open IndexedDB
  useEffect(() => {
    openDB(DB_NAME, STORE_NAME).then(setDb);
  }, []);

  // Load saved content
  useEffect(() => {
    if (!db || !editorRef.current) return;

    getFromDB(db, STORE_NAME, DOC_KEY).then((saved) => {
      if (editorRef.current) {
        editorRef.current.textContent = saved || "";
        if (placeholderRef.current)
          placeholderRef.current.style.display = saved?.length ? "none" : "block";

        // Update session counts
        const words = (saved || "").trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);
        setCharCount((saved || "").length);
        setWriting((saved || "").length > 0);
      }
    });
  }, [db, setWordCount, setCharCount, setWriting]);

  // Placeholder animation
  useEffect(() => {
    if (!placeholderRef.current || !caretRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to([placeholderRef.current, caretRef.current], {
      opacity: 0,
      duration: 0.5,
      ease: "power1.inOut",
      onComplete: () => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length),
    }).to([placeholderRef.current, caretRef.current], {
      opacity: 1,
      duration: 0.5,
      ease: "power1.inOut",
      delay: 0.5,
    });

    return () => {
    tl.kill();
  };
  }, []);

  // Auto-save on input
  const handleInput = async (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";

    // Update session store
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(text.length);
    setWriting(text.length > 0);

    if (placeholderRef.current) {
      placeholderRef.current.style.display = text.length > 0 ? "none" : "block";
    }

    updateCaretPosition();

    // Debounced save
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (db) {
        saveToDB(db, STORE_NAME, DOC_KEY, text);
        setLastSaved(Date.now());
      }
    }, 800);
  };

  // Update caret position
  const updateCaretPosition = () => {
    if (!editorRef.current || !caretRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !hasFocus) {
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

    caretRef.current.style.top = `${top - 2}px`; // tweak for font
    caretRef.current.style.left = `${left}px`;
    caretRef.current.style.height = `${rect.height + 2}px`;
    caretRef.current.style.opacity = "1";
  };

  // Track selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (hasFocus) updateCaretPosition();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [hasFocus]);

  const handleBlur = () => {
    setHasFocus(false);
    if (caretRef.current) caretRef.current.style.opacity = "0";
    onBlur?.();
  };

  const handleFocus = () => {
    setHasFocus(true);
    setTimeout(updateCaretPosition, 10);
    onFocus?.();
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto h-full text-foreground bg-background">
      <div
        ref={placeholderRef}
        className="pointer-events-none absolute top-5 left-8 text-primary/50 select-none whitespace-pre-wrap text-2xl font-extralight"
      >
        {PLACEHOLDERS[placeholderIndex]}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        spellCheck={false}
        className="min-h-[100%] outline-none whitespace-pre-wrap break-words relative z-10 py-4 px-4 text-2xl font-normal leading-snug"
        style={{ caretColor: "transparent" }}
      />
      <div
        ref={caretRef}
        className="absolute w-[3px] bg-yellow-400 rounded-sm"
        style={{ top: 0, left: 0, opacity: 0, pointerEvents: "none", zIndex: 10 }}
      />
    </div>
  );
}
