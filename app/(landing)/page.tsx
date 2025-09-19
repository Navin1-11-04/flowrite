"use client";

import { Navbar } from "./_components/navbar";


const LandingPage = () => {
  return (
    <div className="min-h-full h-full flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Your page content here */}
      </main>
    </div>
  );
};

export default LandingPage;
