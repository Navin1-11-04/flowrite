"use client"

import { useUserStore } from "@/store/useUserStore";
import { Header } from "./_components/header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
      const { user, isLoading, isAuthenticated } = useUserStore();
    
  return (
    <div className="w-full h-full flex flex-col gap-y-5 font-poppins">
      <Header />
      <main className="flex-1 w-full h-full flex items-start justify-center p-4">
        <div className="text-center">
        <h2 className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h2>
        <h1 className="text-2xl font-normal">
          {(() => {
            const hour = new Date().getHours();
            const firstName = user?.name?.split(" ")[0] || "User";

            if (hour >= 5 && hour < 12) return `Good morning, ${firstName}`;
            if (hour >= 12 && hour < 17)
              return `Good afternoon, ${firstName}`;
            if (hour >= 17 && hour < 22) return `Good evening, ${firstName}`;

            const lateNightGreetings = [
              "Night owl",
              "Burning the midnight oil?",
              "Who’s still awake?",
              "Insomniac alert!",
              "Up so late, huh?",
            ];

            // Map hour to index 0–4
            const lateHour = (hour - 22 + 5) % 5;
            return `${lateNightGreetings[lateHour]} ${firstName}`;
          })()}
        </h1>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
