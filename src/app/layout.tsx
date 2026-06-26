import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Career Copilot",
  description:
    "Your AI-powered job hunter. Find the perfect job for you. Apply for the job of your dreams. Track your Applications. Get a comprehensive analysis of your resume. And much more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(jetbrainsMono.className)}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
