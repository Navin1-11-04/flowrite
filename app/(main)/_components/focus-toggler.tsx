"use client";

import { useRef, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIconAnimation } from "../_hooks/animation";

interface FocusTogglerProps {
  focusMode: boolean;
  setFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleFooter: () => void;
  isMobile: boolean;
  animateLayoutChange: (fromLayout: string, toLayout: string) => Promise<void>;
}

const FocusToggler = ({
  focusMode,
  setFocusMode,
  onToggleFooter,
  isMobile,
  animateLayoutChange,
}: FocusTogglerProps) => {
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const { animate } = useIconAnimation(iconRef);

  const toggleFocusMode = useCallback(() => {
  onToggleFooter();

  const currentLayout = focusMode
    ? isMobile ? "mobile-focus" : "desktop-focus"
    : isMobile ? "mobile-normal" : "desktop-normal";

  const newLayout = focusMode
    ? isMobile ? "mobile-normal" : "desktop-normal"
    : isMobile ? "mobile-focus" : "desktop-focus";

  animateLayoutChange(currentLayout, newLayout).then(() => {
    setFocusMode(!focusMode);
    animate("flip");
  });
}, [focusMode, isMobile, animate, animateLayoutChange, onToggleFooter, setFocusMode]);


  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
      className="rounded-sm shadow-none text-foreground bg-transparent hover:bg-secondary transition-all duration-300 ease-in-out"
      onClick={toggleFocusMode}
    >
      <span ref={iconRef} className="transition-all duration-300 ease-in-out">
        {focusMode ? <EyeOff className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-inherit" /> : <Eye className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-inherit" />}
      </span>
    </Button>
  );
};

export default FocusToggler;
