"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  AvatarIcon, 
  ExitIcon, 
  PersonIcon, 
  ChevronDownIcon,
  DashboardIcon,
  GearIcon 
} from "@radix-ui/react-icons";
import { gsap } from "gsap";

interface UserProfileDropdownProps {
  className?: string;
}

export const UserProfileDropdown = ({ className }: UserProfileDropdownProps) => {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out!");
      router.push("/");
      setIsOpen(false);
    } catch (err: any) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // GSAP animations
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Animate dropdown in
      gsap.fromTo(
        dropdownRef.current,
        {
          opacity: 0,
          y: -10,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        }
      );
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          // Animate out before closing
          gsap.to(dropdownRef.current, {
            opacity: 0,
            y: -10,
            scale: 0.95,
            duration: 0.15,
            ease: "power2.in",
            onComplete: () => setIsOpen(false),
          });
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-full font-normal text-sm shadow-none hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
          <AvatarIcon className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline-block max-w-24 truncate">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDownIcon 
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <AvatarIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleMenuItemClick(() => router.push("/home"))}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent/50 transition-colors text-left"
            >
              <DashboardIcon className="w-4 h-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => handleMenuItemClick(() => router.push("/profile"))}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent/50 transition-colors text-left"
            >
              <PersonIcon className="w-4 h-4" />
              Profile
            </button>
            
            <button
              onClick={() => handleMenuItemClick(() => router.push("/settings"))}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent/50 transition-colors text-left"
            >
              <GearIcon className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Logout Section */}
          <div className="border-t border-border">
            <button
              onClick={() => handleMenuItemClick(handleLogout)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
            >
              <ExitIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};