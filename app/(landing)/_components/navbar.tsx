"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import useScrollTop from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { auth, provider, signInWithPopup } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useUserStore } from "@/store/useUserStore";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out!");
      router.push("/");
    } catch (err: any) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
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
        "z-50 bg-background fixed top-0 flex items-center w-full p-2 font-poppins text-foreground",
        scrolled && "backdrop-blur-md border-b border-border/40"
      )}
    >
      <h1 
        className="h-8 flex items-center justify-center leading-0 px-2 text-lg cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push("/")}
      >
        Flo
      </h1>
      
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2 px-2">
        {isLoading && <Spinner />}

        {!isLoading && !isAuthenticated && (
          <>
            <Button variant="ghost" onClick={handleLogin}>
              Login
            </Button>
            <Button onClick={handleGetStarted}>
              Get Started
            </Button>
          </>
        )}

        {!isLoading && isAuthenticated && user && (
          <div className="flex items-center gap-x-2">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/home")}
              className="hidden sm:inline-flex"
            >
              Dashboard
            </Button>
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt={user.name || "User"}
              className="h-8 w-8 rounded-full ring-2 ring-border"
            />
            <span className="hidden sm:inline">{user.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}

        <ModeToggle />
      </div>
    </div>
  );
};