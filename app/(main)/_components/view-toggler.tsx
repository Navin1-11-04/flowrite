"use client";

import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIconAnimation } from "../_hooks/animation";

const ViewToggler = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iconWrapperRef = useRef<HTMLSpanElement>(null);
  const { animate } = useIconAnimation(iconWrapperRef);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }

    animate("rotate", { duration: 0.3 });
  }, [animate]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullscreen}
      className="rounded-full shadow-none text-foreground border-transparent hover:border-input hover:bg-transparent hover:text-muted-foreground transition-all duration-300 ease-in-out
      dark:bg-transparent dark:border-none"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <span ref={iconWrapperRef} className="transition-all duration-300 ease-in-out">
        {isFullscreen ? (
          <Minimize className="w-4 h-4 stroke-[2] text-inherit" />
        ) : (
          <Maximize className="w-4 h-4 stroke-[2] text-inherit" />
        )}
      </span>
    </Button>
  );
};

export default ViewToggler;
