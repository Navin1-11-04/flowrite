"use client";

import { Navbar } from "./_components/navbar";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { auth, provider, signInWithPopup } from "@/lib/firebase";
import { toast } from "sonner";

const LandingPage = () => {
  const { isAuthenticated, isLoading } = useUserStore();
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
    <div className="min-h-full h-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-16"> 
          
      </main>
    </div>
  );
};

export default LandingPage;