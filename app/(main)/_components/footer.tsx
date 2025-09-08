"use client";

import { useSession } from "@/store/useSession";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { CheckCircle, XCircle } from "lucide-react";

export const Footer = () => {
  const { wordCount, charCount } = useSession();

  return (
    <footer className="w-full flex items-center justify-between 
      text-xs sm:text-sm text-primary/50 font-medium px-4 py-3">
      
      {/* Stats section */}
      <div className="flex items-center gap-x-0.5 sm:gap-x-1 md:gap-x-1">
        <span className="whitespace-nowrap">
          <span className="hidden sm:inline">Words : </span>
          <span className="sm:hidden font-medium">W : </span>
          {wordCount}
        </span>
        <span className="whitespace-nowrap">
          ({" "}{charCount}{" "}
            <span className="hidden sm:inline">: chars</span>
          <span className="sm:hidden font-medium">: c</span>
         {" "})
        </span>
      </div>
    </footer>
  );
};