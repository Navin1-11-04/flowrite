"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "./_components/editor";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";
import { CreateWorkspaceModal } from "./_components/create-workspace-modal";
import { useWorkspace } from "@/store/useWorkspace";
import { useSession } from "@/store/useSession";
import gsap from "gsap";

const MainPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showFooter, setShowFooter] = useState(true);
  const footerRef = useRef<HTMLDivElement>(null);

  // Initialize stores
  const { loadWorkspaces, isLoading, workspaces, error, clearError, currentWorkspaceId } = useWorkspace();
  const { startSession } = useSession();

  // Track initialization to prevent multiple calls
  const [initialized, setInitialized] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize app on mount
  useEffect(() => {
    if (initialized) return;
    
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
  }, [initialized, loadWorkspaces, startSession]);

  // Check if we need to show create workspace modal
  useEffect(() => {
    if (initialized && !isLoading && workspaces.length === 0 && !currentWorkspaceId && !error) {
      setShowCreateModal(true);
    } else {
      setShowCreateModal(false);
    }
  }, [initialized, isLoading, workspaces.length, currentWorkspaceId, error]);

  // Handle footer visibility with animation
  useEffect(() => {
    if (!footerRef.current) return;

    if (showFooter) {
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
  }, [showFooter]);

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
                  localStorage.clear();
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
    <>
      <div className="group w-full min-h-screen h-screen flex flex-col bg-background text-foreground p-5 gap-y-2 relative overflow-hidden">
        <Navbar onToggleFooter={() => setShowFooter(!showFooter)} />

        {/* Scrollable editor container */}
        <main
          ref={scrollContainerRef}
          className="flex-1 h-full w-full leading-none my-[5vh] md:my-[15vh] overflow-y-auto place-items-center relative"
          style={{
            scrollbarGutter: "stable",
          }}
        >
          <Editor />
        </main>
        
        <div
          ref={footerRef}
          className="absolute bottom-0 left-0 z-20 right-0 translate-y-0 opacity-100"
        >
          <Footer />
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </>
  );
};

export default MainPage;