"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "./_components/editor";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";
import gsap from "gsap";

const MainPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [editorFocused, setEditorFocused] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="group w-full min-h-screen h-screen flex flex-col bg-background text-foreground p-5 gap-y-2 relative overflow-hidden">
      <Navbar />

      {/* Scrollable editor container */}
      <main
        ref={scrollContainerRef}
        className="flex-1 h-full w-full leading-none my-[15vh] overflow-y-auto place-items-center relative"
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
