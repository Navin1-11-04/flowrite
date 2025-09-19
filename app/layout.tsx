import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import UserProvider from "@/components/providers/user-provider";

export const metadata: Metadata = {
  title: "Floww – Minimal Writing Workspace",
  description:
    "Floww is a distraction-free writing app that helps you focus, organize, and create beautifully with a clean, minimal UI.",
  icons: {
    icon: [
      { url: "/fav_light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/fav_dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="flo-theme"
            >
          <Toaster position="bottom-right" />
            <UserProvider>
            {children}
            </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
