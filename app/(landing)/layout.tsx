"use client";

import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/useUserStore";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useUserStore();

  // Show loader until auth state is determined
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Once loading is complete, show the landing page regardless of auth state
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
};

export default LandingLayout;