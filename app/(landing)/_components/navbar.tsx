"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import useScrollTop from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { auth, provider, signInWithPopup } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useUserStore } from "@/store/useUserStore";
import { Spinner } from "@/components/ui/spinner";

export const Navbar = () => {
  const { user, loading } = useUserStore();
  const scrolled = useScrollTop();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div
      className={cn(
        "z-50 bg-background fixed top-0 flex items-center w-full p-2 font-poppins text-foreground",
        scrolled && "backdrop-blur-md"
      )}
    >
      <h1 className="h-8 flex items-center justify-center leading-0 px-2 text-lg">
        Flo
      </h1>
      <div
        className="md:ml-auto md:justify-end justify-between
           w-full flex items-center gap-x-2 px-2"
      >
        {loading && (
            <Spinner/>
        )}

        {!loading && !user && (
          <Button onClick={handleLogin}>Login</Button>
        )}

        {!loading && user && (
          <div className="flex items-center gap-x-2">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt={user.name || "User"}
              className="h-8 w-8 rounded-full"
            />
            <span>{user.name}</span>
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
