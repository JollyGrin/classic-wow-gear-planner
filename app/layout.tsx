import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import { Nav } from "./components/nav";
import { BisListProvider } from "./hooks/use-bis-list";
import { LevelProvider } from "./hooks/use-level";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gear Journey - WoW BiS Progression Planner",
  description: "Plan your best-in-slot gear progression for World of Warcraft Classic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <BisListProvider>
              <LevelProvider>
                <div className="min-h-screen bg-background">
                  <Nav />
                  <main className="container mx-auto px-4 py-6">
                    {children}
                  </main>
                </div>
              </LevelProvider>
            </BisListProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
