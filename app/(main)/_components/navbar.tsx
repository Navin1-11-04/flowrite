"use client";

import { Ellipsis } from "lucide-react";
import { Groups } from "./groups";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Maximize, Minimize, Sun, Moon, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Menu } from "./menu";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // now we are sure we are on the client
  }, []);
  const iconRefs = useRef<Record<string, SVGSVGElement | null>>({});

  const pulse = (id: string) => {
    const el = iconRefs.current[id];
    if (!el) return;

    gsap.set(el, { transformOrigin: "50% 50%" });

    if (id === "plus") {
      // timeline for plus icon
      gsap
        .timeline()
        .to(el, { scale: 1.3, duration: 0.25, ease: "power2.out" })
        .to(el, { rotate: "+=180", duration: 0.4, ease: "power2.out" }, 0)
        .to(el, { scale: 1, duration: 0.25, ease: "power2.out" });
    } else {
      // pulse for other icons including ellipsis
      gsap
        .timeline()
        .to(el, { scale: 1.3, duration: 0.2, ease: "power2.out" })
        .to(el, { scale: 1, duration: 0.2, ease: "power2.out" });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const el = iconRefs.current["theme"];
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 0, rotate: -90, opacity: 0 },
      { scale: 1, rotate: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  }, [theme]);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const iconClass =
    "w-5 h-5 stroke-[2] text-inherit transition-all duration-300 ease-in-out";

  return (
    <nav className="w-full leading-none flex items-center justify-between">
      {!focusMode && (
        <div className="flex items-center gap-x-2.5">
          <Image
            alt="logo"
            src="/logo_dark.svg"
            height={40}
            width={80}
            className="hidden dark:block h-auto"
          />
          <Image
            alt="logo"
            src="/logo_Light.svg"
            height={40}
            width={80}
            className="dark:hidden h-auto"
          />
          <span className="rotate-110 bg-ring w-6 h-[1px] rounded-full"></span>
          <Groups />
        </div>
      )}

      <div className="flex items-center gap-x-10">
        <div className="flex items-center gap-x-2">
          {/* Focus toggle */}
          <Button
            size="icon"
            onClick={() => {
              setFocusMode(!focusMode);
              pulse("focus");
            }}
            className="shadow-none rounded-full max-h-7 bg-transparent hover:bg-transparent border border-transparent hover:border-input text-foreground hover:text-muted-foreground"
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
          </Button>

          {focusMode ? (
            <Button
              size="icon"
              onClick={() => {
                toggleFullscreen();
                pulse("fullscreen");
              }}
              className="shadow-none rounded-full max-h-7 bg-transparent hover:bg-transparent border border-transparent hover:border-input text-foreground hover:text-muted-foreground"
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
            </Button>
          ) : (
            <>
              {/* Theme Toggler with GSAP animation */}
              <Button
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="shadow-none rounded-full max-h-7 bg-transparent hover:bg-transparent border border-transparent hover:border-input text-foreground hover:text-muted-foreground flex items-center justify-center"
              >
                {mounted &&
                  (theme === "dark" ? (
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
                  ))}
              </Button>
              <Button
                size="icon"
                onClick={() => {
                  toggleFullscreen();
                  pulse("fullscreen");
                }}
                className="shadow-none rounded-full max-h-7 bg-transparent hover:bg-transparent border border-transparent hover:border-input text-foreground hover:text-muted-foreground mr-5"
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
              </Button>

              {/* New Page */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => pulse("plus")}
                className="shadow-none rounded-full max-h-7 hover:bg-primary hover:text-background flex items-center"
              >
                <Plus
                  ref={(el) => {
                    iconRefs.current["plus"] = el;
                  }}
                  className={iconClass}
                />
                <span className="text-[13px] font-medium">New Page</span>
              </Button>
            </>
          )}
        </div>

        {!focusMode && (
         <Menu pulse={pulse} iconRefs={iconRefs} />
        )}
      </div>
    </nav>
  );
};
