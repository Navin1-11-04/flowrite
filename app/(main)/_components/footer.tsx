"use client";

import { useSession } from "@/store/useSession";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { CheckCircle, XCircle } from "lucide-react";

export const Footer = () => {
  const { wordCount, charCount, lastSaved } = useSession();
  const [timeAgo, setTimeAgo] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const iconRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      if (!lastSaved) {
        setIsSaved(false);
        setTimeAgo("Not saved yet");
        return;
      }

      const diff = Math.floor((Date.now() - lastSaved) / 1000);

      setIsSaved(diff <= 5);

      if (diff < 5) setTimeAgo("Just now");
      else if (diff < 60) setTimeAgo(`${diff}s ago`);
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      else setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  useEffect(() => {
    if (!iconRef.current) return;

    const icon = iconRef.current;

    if (isSaved) {
      gsap.fromTo(
        icon,
        { scale: 1 },
        {
          scale: 1.5,
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        }
      );
    } else {
      gsap.to(icon, { scale: 1, duration: 0.2 });
    }
  }, [lastSaved, isSaved]);

  return (
    <footer className="w-full flex items-center justify-between 
      text-xs sm:text-sm text-primary/50 font-medium 
      px-8 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
      
      {/* Stats section */}
      <div className="flex items-center gap-x-0.5 sm:gap-x-1 md:gap-x-1">
        <span className="whitespace-nowrap">
          <span className="hidden sm:inline">Words : </span>
          <span className="sm:hidden font-medium">W : </span>
          {wordCount}
        </span>
        <span className="whitespace-nowrap">
          ({" "}{charCount}
            <span className="hidden sm:inline"> chars</span>
          <span className="sm:hidden font-medium"> c</span>
         {" "})
        </span>
      </div>

      {/* Save status section */}
      <div className="flex items-center gap-x-1 sm:gap-x-2">
        {isSaved ? (
          <CheckCircle
            ref={iconRef}
            className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 transition-transform duration-300 flex-shrink-0"
          />
        ) : (
          <XCircle
            ref={iconRef}
            className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 transition-transform duration-300 flex-shrink-0"
          />
        )}
        <span className="font-medium whitespace-nowrap text-xs sm:text-sm">{timeAgo}</span>
      </div>
    </footer>
  );
};