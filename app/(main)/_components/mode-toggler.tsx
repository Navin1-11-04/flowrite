"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useRef, useEffect, useState } from "react";
import { useIconAnimation } from "../_hooks/animation";

const ModeToggler = () => {
  const { theme, setTheme } = useTheme();
  const iconWrapperRef = useRef<HTMLSpanElement>(null);
  const { animate } = useIconAnimation(iconWrapperRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";

    animate("theme-switch", { duration: 0.2, ease: "power2.in" }, () =>
      setTheme(newTheme)
    );
  }, [theme, setTheme, animate]);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-sm shadow-none text-foreground border-transparent hover:border-input hover:bg-transparent hover:text-muted-foreground transition-all duration-300 ease-in-out"
        disabled
      >
        <Sun className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleTheme}
      className="rounded-sm shadow-none text-foreground bg-transparent hover:bg-secondary transition-all duration-300 ease-in-out"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span ref={iconWrapperRef} className="transition-all duration-300 ease-in-out">
        {theme === "dark" ? (
          <Moon className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-inherit" />
        ) : (
          <Sun className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-inherit" />
        )}
      </span>
    </Button>
  );
};

export default ModeToggler;
