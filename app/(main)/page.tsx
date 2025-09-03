"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "./_components/editor";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";
import { useWorkspace } from "@/store/useWorkspace";
import { useSession } from "@/store/useSession";
import gsap from "gsap";

const MainPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [editorFocused, setEditorFocused] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  // Initialize stores
  const { loadWorkspaces, isLoading, workspaces, error, clearError } = useWorkspace();
  const { startSession } = useSession();

  // Track initialization to prevent multiple calls
  const [initialized, setInitialized] = useState(false);

  // Initialize app on mount - FIXED: Added proper dependency array
  useEffect(() => {
    if (initialized) return; // Prevent multiple initializations
    
    console.log('MainPage initializing...');

    const initialize = async () => {
      try {
        console.log('Starting initialization...');
        
        // Start session first
        startSession();
        console.log('Session started');

        // Load workspaces
        await loadWorkspaces();
        console.log('Load workspaces completed');
        
        setInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    
    initialize();
  }, [initialized, loadWorkspaces, startSession]); // FIXED: Added dependencies

  useEffect(() => {
    if (!footerRef.current) return;

    if (!editorFocused) {
      // Show footer
      gsap.to(footerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      });
    } else {
      // Hide footer
      gsap.to(footerRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [editorFocused]);

  // Show error state
  if (error) {
    return (
      <div className="w-full min-h-screen h-screen flex flex-col bg-background text-foreground p-5">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={clearError}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md mr-2"
              >
                Try Again
              </button>
              <button 
                onClick={() => {
                  // Clear IndexedDB and reload
                  if (window.indexedDB) {
                    indexedDB.deleteDatabase("WritingApp");
                  }
                  window.location.reload();
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (isLoading || !initialized) {
    return (
      <div className="w-full min-h-screen h-screen flex flex-col bg-background text-foreground">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group w-full min-h-screen h-screen flex flex-col bg-background text-foreground p-5 gap-y-2 relative overflow-hidden">
      <Navbar />

      {/* Scrollable editor container */}
      <main
        ref={scrollContainerRef}
        className="flex-1 h-full w-full leading-none my-[5vh] md:my-[15vh] overflow-y-auto place-items-center relative"
        style={{
          scrollbarGutter: "stable",
        }}
      >
        <Editor
          onFocus={() => setEditorFocused(true)}
          onBlur={() => setEditorFocused(false)}
        />
      </main>
      
      <div
        ref={footerRef}
        className="absolute bottom-0 left-0 z-20 right-0 translate-y-full opacity-0"
      >
        <Footer />
      </div>
    </div>
  );
};

export default MainPage;