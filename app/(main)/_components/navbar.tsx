"use client";

import { Groups } from "./groups";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Menu } from "./menu";
import { useWorkspace } from "@/store/useWorkspace";
import ModeToggler from "./mode-toggler";
import ViewToggler from "./view-toggler";
import FocusToggler from "./focus-toggler";
import NewPage from "./new-page";

interface NavbarProps {
  onToggleFooter: () => void;
}

export const Navbar = ({ onToggleFooter }: NavbarProps) => {
  const { createPage } = useWorkspace();

  const [focusMode, setFocusMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const desktopLeftRef = useRef<HTMLDivElement>(null);
  const desktopRightRef = useRef<HTMLDivElement>(null);
  const focusCenterRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLSpanElement>(null);
  const iconRefs = useRef<Record<string, SVGSVGElement | null>>({});

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pulse = useCallback((id: string) => {
    const el = iconRefs.current[id];
    if (!el) return;

    gsap.set(el, { transformOrigin: "50% 50%" });

    if (id === "plus") {
      gsap
        .timeline()
        .to(el, {
          scale: 1.3,
          duration: 0.25,
          ease: "back.out(1.7)",
        })
        .to(
          el,
          {
            rotate: "+=180",
            duration: 0.4,
            ease: "power2.out",
          },
          0
        )
        .to(el, {
          scale: 1,
          duration: 0.25,
          ease: "power2.out",
        });
    } else {
      gsap
        .timeline()
        .to(el, {
          scale: 1.3,
          duration: 0.2,
          ease: "back.out(2)",
        })
        .to(el, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
    }
  }, []);

  // Animate layout transitions
  const animateLayoutChange = useCallback(
    (fromLayout: string, toLayout: string): Promise<void> => {
      return new Promise((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });

        if (fromLayout === "mobile-normal" && toLayout === "mobile-focus") {
          // Mobile normal to focus - hide top and bottom rows
          const elementsToHide = [
            topRowRef.current,
            bottomRowRef.current,
          ].filter(Boolean);
          if (elementsToHide.length > 0) {
            tl.to(elementsToHide, {
              opacity: 0,
              y: -10,
              duration: 0.25,
              ease: "power2.in",
            });
          }
        } else if (
          fromLayout === "mobile-focus" &&
          toLayout === "mobile-normal"
        ) {
          // Mobile focus to normal - elements don't exist yet, just add minimal delay
          // React will handle rendering the new DOM structure
          tl.set({}, { duration: 0.1 });
        } else if (
          fromLayout === "desktop-normal" &&
          toLayout === "desktop-focus"
        ) {
          // Desktop normal to focus - hide left section smoothly
          tl.to(desktopLeftRef.current, {
            opacity: 0,
            x: -30,
            duration: 0.3,
            ease: "power2.in",
          });
        } else if (
          fromLayout === "desktop-focus" &&
          toLayout === "desktop-normal"
        ) {
          // Desktop focus to normal - show left section
          tl.fromTo(
            desktopLeftRef.current,
            {
              opacity: 0,
              x: -30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: "back.out(1.7)",
            }
          );
        }
      });
    },
    []
  );

  // Initial mount animations
  useEffect(() => {
    if (!mounted) return;

    const tl = gsap.timeline({ delay: 0.1 });

    if (isMobile) {
      if (focusMode) {
        // Mount animation for mobile focus mode
        tl.fromTo(
          focusCenterRef.current,
          { opacity: 0, y: -20, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          }
        );
      } else {
        // Mobile normal mount animation
        tl.fromTo(
          [topRowRef.current, bottomRowRef.current],
          {
            opacity: 0,
            y: -20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
          }
        );
      }
    } else {
      // Desktop mount animation
      tl.fromTo(
        logoRef.current,
        {
          opacity: 0,
          x: -30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
        }
      )
        .fromTo(
          separatorRef.current,
          {
            scaleX: 0,
            opacity: 0,
          },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.2"
        )
        .fromTo(
          desktopRightRef.current
            ? Array.from(desktopRightRef.current.querySelectorAll("button"))
            : [],
          {
            opacity: 0,
            scale: 0.8,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
            stagger: 0.05,
          },
          "-=0.3"
        );
    }
  }, [mounted, isMobile, focusMode]);


  if (!mounted) {
    return null;
  }

  if (isMobile && !focusMode) {
    return (
      <nav ref={navRef} className="w-full leading-none p-2">
        <div
          ref={topRowRef}
          className="flex items-center justify-between px-4 pb-2"
        >
          <div ref={logoRef} className="flex-shrink-0">
            <Image
              alt="logo"
              src="/logo_dark.svg"
              width={55}
              height={30}
              className="hidden dark:block h-auto w-auto max-h-3"
              priority
            />
            <Image
              alt="logo"
              src="/logo_Light.svg"
              width={55}
              height={30}
              className="dark:hidden h-auto w-auto max-h-3.5"
              priority
            />
          </div>
          <Menu pulse={pulse} iconRefs={iconRefs} />
        </div>

        <div
          ref={bottomRowRef}
          className="flex items-center justify-between px-4 py-2 border-t border-border/50"
        >
          <div className="min-w-0 flex-1">
            <Groups />
          </div>

          <div className="flex items-center gap-x-2 flex-shrink-0">
            <FocusToggler
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              onToggleFooter={onToggleFooter}
              isMobile={isMobile}
              animateLayoutChange={animateLayoutChange}
            />

            <ModeToggler />
            <NewPage />
          </div>
        </div>
      </nav>
    );
  }

  // Mobile Focus Mode
  if (isMobile && focusMode) {
    return (
      <nav
        ref={navRef}
        className="w-full leading-none flex items-center justify-center px-4 py-2"
      >
        <div ref={focusCenterRef} className="flex items-center gap-x-3">
          <FocusToggler
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            onToggleFooter={onToggleFooter}
            isMobile={isMobile}
            animateLayoutChange={animateLayoutChange}
          />
          <NewPage/>
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      className="w-full leading-none flex items-center justify-between px-4 py-2 border-b border-secondary"
    >
      {!focusMode && (
        <div
          ref={desktopLeftRef}
          className="flex items-center gap-x-2.5 min-w-0 flex-1"
        >
          <div ref={logoRef} className="flex-shrink-0 flex items-center mb-0.5">
            <Image
              alt="logo"
              src="/logo_dark.svg"
              height={30}
              width={50}
              className="hidden dark:block h-auto"
              priority
            />
            <Image
              alt="logo"
              src="/logo_Light.svg"
              height={30}
              width={50}
              className="dark:hidden h-auto"
              priority
            />
          </div>

          <span
            ref={separatorRef}
            className="rotate-110 bg-ring w-6 h-[1px] rounded-full flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <Groups />
          </div>
        </div>
      )}

      <div
        ref={desktopRightRef}
        className="flex items-center gap-x-3 flex-shrink-0"
      >
        <div className="flex items-center gap-x-3">
          <FocusToggler
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            onToggleFooter={onToggleFooter}
            isMobile={isMobile}
            animateLayoutChange={animateLayoutChange}
          />

          {focusMode ? (
            <ViewToggler />
          ) : (
            <>
              <ModeToggler />
              <ViewToggler />
              <NewPage />
            </>
          )}
        </div>

        {!focusMode && <Menu iconRefs={iconRefs} />}
      </div>
    </nav>
  );
};
