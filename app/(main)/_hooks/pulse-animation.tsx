import { useRef } from "react";
import { gsap } from "gsap";

export const usePulse = () => {
  const ref = useRef<SVGSVGElement>(null);

  const triggerPulse = () => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { scale: 1 },
        { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
      );
    }
  };

  return { ref, triggerPulse };
};
