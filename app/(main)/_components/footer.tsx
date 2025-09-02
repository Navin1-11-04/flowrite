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
      else if (diff < 60) setTimeAgo(`${diff} sec ago`);
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)} min ago`);
      else setTimeAgo(`${Math.floor(diff / 3600)} hr ago`);
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
    <footer className="w-full flex items-center justify-between text-sm text-primary/50 font-medium p-6">
      <div className="flex items-center gap-x-5">
        <span>Words: {wordCount}</span>
        <span>Chars: {charCount}</span>
      </div>

      <div className="flex items-center gap-x-2">
        {isSaved ? (
          <CheckCircle
            ref={iconRef}
            className="w-4 h-4 text-green-500 transition-transform duration-300"
          />
        ) : (
          <XCircle
            ref={iconRef}
            className="w-4 h-4 text-red-500 transition-transform duration-300"
          />
        )}
        <span className="whitespace-nowrap">{timeAgo}</span>
      </div>
    </footer>
  );
};
