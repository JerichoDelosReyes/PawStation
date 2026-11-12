import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "PawStation - Gentle Care, Built Around Your Cat",
  description:
    "PawStation is an ESP32-powered smart cat feeding and watering station with real-time IoT monitoring. Automated dry kibble, fresh water replenishment, and digital scale monitoring.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

const themeScript = `
  try {
    const stored = localStorage.getItem('pawstation-theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-[#18181B] dark:text-[#F4F4F5] antialiased transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
