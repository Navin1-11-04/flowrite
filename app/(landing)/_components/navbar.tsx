"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import useScrollTop from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { auth, provider, signInWithPopup } from "@/lib/firebase";
import { useUserStore } from "@/store/useUserStore";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { UserProfileDropdown } from "./user-profile";

export const Navbar = () => {
  const { user, isLoading, isAuthenticated } = useUserStore();
  const scrolled = useScrollTop();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in!");
      router.push("/home");
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/home");
    } else {
      handleLogin();
    }
  };

  return (
    <div
      className={cn(
        "z-50 bg-background fixed top-0 flex items-center w-full p-4 font-poppins text-foreground",
        scrolled && "backdrop-blur-md border-b border-border/40"
      )}
    >
      <h1 
        className="h-8 flex items-center justify-center leading-0 px-2 text-lg cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push("/")}
      >
        Flo
      </h1>
      
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-1 sm:gap-x-2 px-2">
        
        {/* Show loading state only in navbar */}
        {isLoading && (
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
          </div>
        )}

        {/* Not authenticated - show login options */}
        {!isLoading && !isAuthenticated && (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" onClick={handleLogin} className="rounded-full font-normal text-xs sm:text-sm shadow-none px-3 sm:px-4">
              Log in
            </Button>
            <Button onClick={handleGetStarted} className="rounded-full font-normal text-xs sm:text-sm shadow-none px-3 sm:px-4">
              <span className="hidden xs:inline">Get started</span>
              <span className="xs:hidden">Start</span>
              <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1"/>
            </Button>
          </div>
        )}

        {/* Authenticated - show user profile dropdown */}
        {!isLoading && isAuthenticated && user && (
          <div className="flex items-center gap-x-1 sm:gap-x-2">
            <Button 
              variant="default" 
              onClick={() => router.push("/home")}
              className="hidden sm:inline-flex rounded-full font-normal text-sm shadow-none"
            >
              Dashboard<ArrowRightIcon className="ml-1"/>
            </Button>
            <UserProfileDropdown />
          </div>
        )}

        <ModeToggle />
      </div>
    </div>
  );
};