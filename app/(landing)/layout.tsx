"use client";

import { useEffect, useState } from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during hydration to prevent mismatch
  if (!mounted) {
    return null;
  }

  // Always show the landing page - let navbar handle auth state
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
};

export default LandingLayout;