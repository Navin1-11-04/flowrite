"use client";

import { Ellipsis } from "lucide-react";
import { Groups } from "./groups";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Maximize, Minimize, Sun, Moon, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Menu } from "./menu";
import { useWorkspace } from "@/store/useWorkspace";


export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { createPage, loadWorkspaces } = useWorkspace();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for elements that need animation
  const navRef = useRef<HTMLElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const desktopLeftRef = useRef<HTMLDivElement>(null);
  const desktopRightRef = useRef<HTMLDivElement>(null);
  const focusCenterRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLSpanElement>(null);
  const iconRefs = useRef<Record<string, SVGSVGElement | null>>({});

  // Handle resize and mount effects
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    
    // Load workspaces on mount
    loadWorkspaces();
    
    return () => window.removeEventListener("resize", onResize);
  }, [loadWorkspaces]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // Enhanced pulse animation
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
  const animateLayoutChange = useCallback((fromLayout: string, toLayout: string): Promise<void> => {
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });

      if (fromLayout === "mobile-normal" && toLayout === "mobile-focus") {
        // Mobile normal to focus - simplified
        tl.to([topRowRef.current, bottomRowRef.current], {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      } else if (fromLayout === "mobile-focus" && toLayout === "mobile-normal") {
        // Mobile focus to normal - simplified
        tl.fromTo(
          [topRowRef.current, bottomRowRef.current],
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          }
        );
      } else if (fromLayout === "desktop-normal" && toLayout === "desktop-focus") {
        // Desktop normal to focus
        tl.to(desktopLeftRef.current, {
          opacity: 0,
          x: -50,
          duration: 0.3,
          ease: "power2.in",
        }).to(
          desktopRightRef.current,
          {
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.1"
        );
      } else if (fromLayout === "desktop-focus" && toLayout === "desktop-normal") {
        // Desktop focus to normal
        tl.fromTo(
          desktopLeftRef.current,
          {
            opacity: 0,
            x: -50,
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
  }, []);

  // Handle focus mode toggle with animation
  const toggleFocusMode = useCallback(() => {
    pulse("focus");
    
    // Update state immediately for mobile, with animation for desktop
    if (isMobile) {
      setFocusMode(!focusMode);
    } else {
      const currentLayout = focusMode ? "desktop-focus" : "desktop-normal";
      const newLayout = focusMode ? "desktop-normal" : "desktop-focus";
      
      animateLayoutChange(currentLayout, newLayout).then(() => {
        setFocusMode(!focusMode);
      });
    }
  }, [isMobile, focusMode, animateLayoutChange, pulse]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Animate theme change
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";

    // Animate the theme icon
    const el = iconRefs.current["theme"];
    if (el) {
      gsap
        .timeline()
        .to(el, {
          scale: 0,
          rotate: -90,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        })
        .call(() => setTheme(newTheme))
        .fromTo(
          el,
          {
            scale: 0,
            rotate: 90,
            opacity: 0,
          },
          {
            scale: 1,
            rotate: 0,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)",
          }
        );
    } else {
      setTheme(newTheme);
    }
  }, [theme, setTheme]);

  // Handle new page creation
  const handleNewPage = useCallback(async () => {
    pulse("plus");
    await createPage("Untitled");
  }, [createPage, pulse]);

  // Initial mount animations
  useEffect(() => {
    if (!mounted) return;

    const tl = gsap.timeline({ delay: 0.1 });

    if (isMobile) {
      // Mobile mount animation
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
          desktopRightRef.current ? Array.from(desktopRightRef.current.querySelectorAll("button")) : [],
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
  }, [mounted, isMobile]);

  // Button hover animations
  const handleButtonHover = useCallback((el: HTMLButtonElement, isEntering: boolean) => {
    if (isEntering) {
      gsap.to(el, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      });
    } else {
      gsap.to(el, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  }, []);

  // Early return for SSR/hydration mismatch prevention
  if (!mounted || !theme) {
    return null;
  }

  const iconClass =
    "w-4 h-4 md:w-5 md:h-5 stroke-[2] text-inherit transition-all duration-300 ease-in-out";

  const buttonClass =
    "shadow-none rounded-full h-8 w-8 md:max-h-7 bg-transparent hover:bg-transparent border border-transparent hover:border-input text-foreground hover:text-muted-foreground transition-all duration-300 ease-out";

  // Enhanced Button component with hover animations
  const AnimatedButton = ({ children, onClick, className, ...props }: any) => (
    <Button
      {...props}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
      onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
    >
      {children}
    </Button>
  );

  // Mobile Layout
  if (isMobile && !focusMode) {
    return (
      <nav ref={navRef} className="w-full leading-none">
        {/* Top Row */}
        <div
          ref={topRowRef}
          className="flex items-center justify-between px-4 pb-2"
        >
          <div ref={logoRef} className="flex-shrink-0">
            <Image
              alt="logo"
              src="/logo_dark.svg"
              width={40}
              height={20}
              className="hidden dark:block h-auto w-auto max-h-3"
              priority
            />
            <Image
              alt="logo"
              src="/logo_Light.svg"
              width={40}
              height={20}
              className="dark:hidden h-auto w-auto max-h-3"
              priority
            />
          </div>

          <Menu pulse={pulse} iconRefs={iconRefs} />
        </div>

        {/* Bottom Row */}
        <div
          ref={bottomRowRef}
          className="flex items-center justify-between px-4 py-2 border-t border-border/50"
        >
          <div className="min-w-0 flex-1">
            <Groups />
          </div>

          <div className="flex items-center gap-x-2 flex-shrink-0">
            <AnimatedButton
              size="icon"
              onClick={toggleFocusMode}
              className={buttonClass}
              aria-label="Enter focus mode"
            >
              <Eye
                ref={(el) => {
                  iconRefs.current["focus"] = el;
                }}
                className={iconClass}
              />
            </AnimatedButton>

            <AnimatedButton
              size="icon"
              onClick={toggleTheme}
              className={`${buttonClass} flex items-center justify-center`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? (
                <Moon
                  ref={(el) => {
                    iconRefs.current["theme"] = el;
                  }}
                  className={iconClass}
                />
              ) : (
                <Sun
                  ref={(el) => {
                    iconRefs.current["theme"] = el;
                  }}
                  className={iconClass}
                />
              )}
            </AnimatedButton>

            <AnimatedButton
              size="icon"
              variant="secondary"
              onClick={handleNewPage}
              className="shadow-none rounded-full h-8 w-8 hover:bg-primary hover:text-background flex items-center justify-center transition-all duration-300 ease-out"
              aria-label="New Page"
            >
              <Plus
                ref={(el) => {
                  iconRefs.current["plus"] = el;
                }}
                className={iconClass}
              />
            </AnimatedButton>
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
        className="w-full leading-none flex items-center justify-center px-4 py-2 max-h-[24px]"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div 
          ref={focusCenterRef} 
          className="flex items-center gap-x-3"
          style={{ opacity: 1, visibility: 'visible' }}
        >
          <Button
            size="icon"
            onClick={toggleFocusMode}
            className="shadow-none rounded-full h-10 w-10 bg-transparent hover:bg-muted border border-input text-foreground hover:text-muted-foreground transition-all duration-300 ease-out"
            aria-label="Exit focus mode"
          >
            <EyeOff
              ref={(el) => {
                iconRefs.current["focus"] = el;
              }}
              className="w-5 h-5 stroke-[2]"
            />
          </Button>

          <Button
            size="icon"
            onClick={() => {
              toggleFullscreen();
              pulse("fullscreen");
            }}
            className="shadow-none rounded-full h-10 w-10 bg-transparent hover:bg-muted border border-input text-foreground hover:text-muted-foreground transition-all duration-300 ease-out"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize
                ref={(el) => {
                  iconRefs.current["fullscreen"] = el;
                }}
                className="w-5 h-5 stroke-[2]"
              />
            ) : (
              <Maximize
                ref={(el) => {
                  iconRefs.current["fullscreen"] = el;
                }}
                className="w-5 h-5 stroke-[2]"
              />
            )}
          </Button>
        </div>
      </nav>
    );
  }

  // Desktop Layout
  return (
    <nav
      ref={navRef}
      className="w-full leading-none flex items-center justify-between px-4 py-2"
    >
      {/* Left Section */}
      {!focusMode && (
        <div
          ref={desktopLeftRef}
          className="flex items-center gap-x-2.5 min-w-0 flex-1"
        >
          <div ref={logoRef} className="flex-shrink-0">
            <Image
              alt="logo"
              src="/logo_dark.svg"
              height={40}
              width={80}
              className="hidden dark:block h-auto"
              priority
            />
            <Image
              alt="logo"
              src="/logo_Light.svg"
              height={40}
              width={80}
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

      {/* Right Section */}
      <div
        ref={desktopRightRef}
        className="flex items-center gap-x-10 flex-shrink-0"
      >
        <div className="flex items-center gap-x-2">
          <AnimatedButton
            size="icon"
            onClick={toggleFocusMode}
            className={buttonClass}
            aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
          >
            {focusMode ? (
              <EyeOff
                ref={(el) => {
                  iconRefs.current["focus"] = el;
                }}
                className={iconClass}
              />
            ) : (
              <Eye
                ref={(el) => {
                  iconRefs.current["focus"] = el;
                }}
                className={iconClass}
              />
            )}
          </AnimatedButton>

          {focusMode ? (
            <AnimatedButton
              size="icon"
              onClick={() => {
                toggleFullscreen();
                pulse("fullscreen");
              }}
              className={buttonClass}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize
                  ref={(el) => {
                    iconRefs.current["fullscreen"] = el;
                  }}
                  className={iconClass}
                />
              ) : (
                <Maximize
                  ref={(el) => {
                    iconRefs.current["fullscreen"] = el;
                  }}
                  className={iconClass}
                />
              )}
            </AnimatedButton>
          ) : (
            <>
              <AnimatedButton
                size="icon"
                onClick={toggleTheme}
                className={`${buttonClass} flex items-center justify-center`}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                {theme === "dark" ? (
                  <Moon
                    ref={(el) => {
                      iconRefs.current["theme"] = el;
                    }}
                    className={iconClass}
                  />
                ) : (
                  <Sun
                    ref={(el) => {
                      iconRefs.current["theme"] = el;
                    }}
                    className={iconClass}
                  />
                )}
              </AnimatedButton>

              <AnimatedButton
                size="icon"
                onClick={() => {
                  toggleFullscreen();
                  pulse("fullscreen");
                }}
                className={`${buttonClass} mr-5`}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize
                    ref={(el) => {
                      iconRefs.current["fullscreen"] = el;
                    }}
                    className={iconClass}
                  />
                ) : (
                  <Maximize
                    ref={(el) => {
                      iconRefs.current["fullscreen"] = el;
                    }}
                    className={iconClass}
                  />
                )}
              </AnimatedButton>

              <AnimatedButton
                size="sm"
                variant="secondary"
                onClick={handleNewPage}
                className="shadow-none rounded-full max-h-7 hover:bg-primary hover:text-background flex items-center gap-1 px-4 transition-all duration-300 ease-out"
              >
                <Plus
                  ref={(el) => {
                    iconRefs.current["plus"] = el;
                  }}
                  className={iconClass}
                />
                <span className="text-[13px] font-medium">New Page</span>
              </AnimatedButton>
            </>
          )}
        </div>

        {!focusMode && <Menu pulse={pulse} iconRefs={iconRefs} />}
      </div>
    </nav>
  );
};