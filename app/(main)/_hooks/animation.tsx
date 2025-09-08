import { gsap } from "gsap";
import { RefObject } from "react";

export type AnimationType = 
  | "pulse" 
  | "rotate" 
  | "scale" 
  | "bounce" 
  | "flip" 
  | "shake" 
  | "theme-switch"
  | "heartbeat"
  | "pop-bounce";

export interface AnimationConfig {
  duration?: number;
  ease?: string;
  scale?: number;
  rotation?: number;
  delay?: number;
  yoyo?: boolean;
  repeat?: number;
  scaleUp?: number;
  bounce?: number;
  easeUp?: string;
  easeDown?: string;
}

/**
 * Icon Animation Library
 * Provides reusable GSAP animations for icons
 */
export class IconAnimations {
  /**
   * Basic pulse animation - scales up and down
   */
  static pulse(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.2,
      ease = "back.out(2)",
      scale = 1.3,
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap
      .timeline()
      .to(element, {
        scale,
        duration,
        ease,
      })
      .to(element, {
        scale: 1,
        duration,
        ease: "power2.out",
      });
  }

  /**
   * Theme switch animation - combines scale and rotation with opacity
   */
  static themeSwitch(element: Element | null, onMidPoint?: () => void, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.3,
      ease = "power2.in",
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap
      .timeline()
      .to(element, {
        scale: 0,
        rotate: 180,
        opacity: 0,
        duration,
        ease,
      })
      .call(() => onMidPoint?.())
      .fromTo(
        element,
        {
          scale: 0,
          rotate: 90,
          opacity: 0,
        },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          duration: duration,
        }
      );
  }

  /**
   * Simple scale animation
   */
  static scale(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.3,
      ease = "back.out(1.7)",
      scale = 1.2,
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap
      .timeline()
      .to(element, {
        scale,
        duration: duration * 0.6,
        ease,
      })
      .to(element, {
        scale: 1,
        duration: duration * 0.4,
        ease: "power2.out",
      });
  }

  /**
   * Rotate animation
   */
  static rotate(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.3,
      ease = "power2.out",
      rotation = 180,
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap.timeline().to(element, {
      rotate: `+=${rotation}`,
      duration,
      ease,
    });
  }

  /**
   * Bounce animation
   */
  static bounce(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.6,
      ease = "bounce.out",
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap
      .timeline()
      .to(element, {
        y: -10,
        duration: duration * 0.3,
        ease: "power2.out",
      })
      .to(element, {
        y: 0,
        duration: duration * 0.7,
        ease,
      });
  }

  /**
   * Flip animation (3D rotation on Y-axis) - Enhanced for UI transitions
   */
  static flip(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.6,
      ease = "power2.inOut",
    } = config;

    gsap.set(element, { 
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d"
    });

    return gsap
      .timeline()
      .to(element, {
        rotateY: 90,
        duration: duration * 0.6,
        ease: "power2.in",
      })
      .to(element, {
        rotateY: 90,
        duration: duration * 0.4,
        ease: "power2.out",
      })
      .set(element, {
        rotateY: 0 
      });
  }

  /**
   * Shake animation
   */
  static shake(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.5,
      ease = "power2.inOut",
    } = config;

    return gsap
      .timeline()
      .to(element, {
        x: -3,
        duration: duration * 0.1,
        ease,
      })
      .to(element, {
        x: 3,
        duration: duration * 0.1,
        ease,
      })
      .to(element, {
        x: -2,
        duration: duration * 0.1,
        ease,
      })
      .to(element, {
        x: 2,
        duration: duration * 0.1,
        ease,
      })
      .to(element, {
        x: 0,
        duration: duration * 0.6,
        ease: "power2.out",
      });
  }

  /**
   * Pop-Bounce animation - quick pop up and bounce down
   */
  static popBounce(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.6,
      scaleUp = 1.5,
      bounce = 0.85,
      easeUp = "power2.out",
      easeDown = "bounce.out",
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap
      .timeline()
      .to(element, { 
        scale: scaleUp, 
        duration: duration * 0.3, 
        ease: easeUp 
      })
      .to(element, { 
        scale: bounce, 
        duration: duration * 0.3, 
        ease: easeDown 
      })
      .to(element, { 
        scale: 1, 
        duration: duration * 0.4, 
        ease: "power2.out" 
      });
  }

  /**
   * Heartbeat animation (double pulse)
   */
  static heartbeat(element: Element | null, config: AnimationConfig = {}): gsap.core.Timeline | null {
    if (!element) return null;

    const {
      duration = 0.8,
      ease = "power2.out",
    } = config;

    gsap.set(element, { transformOrigin: "50% 50%" });

    return gsap
      .timeline()
      .to(element, {
        scale: 1.2,
        duration: duration * 0.15,
        ease,
      })
      .to(element, {
        scale: 1,
        duration: duration * 0.15,
        ease,
      })
      .to(element, {
        scale: 1.3,
        duration: duration * 0.2,
        ease,
      })
      .to(element, {
        scale: 1,
        duration: duration * 0.5,
        ease,
      });
  }

  /**
   * Generic animation method that accepts animation type
   */
  static animate(
    element: Element | null, 
    type: AnimationType, 
    config: AnimationConfig = {},
    onMidPoint?: () => void
  ): gsap.core.Timeline | null {
    if (!element) return null;

    switch (type) {
      case "pulse":
        return this.pulse(element, config);
      case "theme-switch":
        return this.themeSwitch(element, onMidPoint, config);
      case "scale":
        return this.scale(element, config);
      case "rotate":
        return this.rotate(element, config);
      case "bounce":
        return this.bounce(element, config);
      case "flip":
        return this.flip(element, config);
      case "shake":
        return this.shake(element, config);
      case "heartbeat":
        return this.heartbeat(element, config);
      case "pop-bounce":
        return this.popBounce(element, config);
      default:
        return this.pulse(element, config);
    }
  }
}

/**
 * Hook-style function for easier React integration
 */
export const useIconAnimation = <T extends Element>(
  ref: RefObject<T | null>
) => {
  const animate = (
    type: AnimationType,
    config?: AnimationConfig,
    onMidPoint?: () => void
  ) => {
    return IconAnimations.animate(ref.current, type, config, onMidPoint);
  };

  return { animate };
};

/**
 * Simple function for non-React usage
 */
export const animateIcon = (
  element: Element | null, 
  type: AnimationType, 
  config?: AnimationConfig, 
  onMidPoint?: () => void
) => {
  return IconAnimations.animate(element, type, config, onMidPoint);
};