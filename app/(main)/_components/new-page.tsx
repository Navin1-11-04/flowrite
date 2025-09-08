"use client";

import { useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/useWorkspace";
import { useIconAnimation } from "../_hooks/animation";

const NewPage = () => {
  const { createPage } = useWorkspace();
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const { animate } = useIconAnimation(iconRef);

  const handleNewPage = useCallback(async () => {
    animate("pop-bounce", {
      duration: 0.6,
      scaleUp: 4.0,
      bounce: 0.3,
      easeUp: "back.out(3)",
      easeDown: "elastic.out(1, 0.3)"
    });
    await createPage("Untitled");
  }, [createPage, animate]);

  return (
    <Button
      size="icon"
      variant="secondary"
      aria-label="New Page"
      className="rounded-sm shadow-none text-foreground bg-transparent hover:bg-secondary transition-all duration-300 ease-in-out"
      onClick={handleNewPage}
    >
      <span ref={iconRef} className="transition-all duration-300 ease-in-out">
        <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[2] text-inherit" />
      </span>
    </Button>
  );
};

export default NewPage;