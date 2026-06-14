import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@/services/clerk/components/ClerkProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const outfitSans = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Incent – AI-Powered Interview Prep",
    template: "%s | Incent",
  },
  description:
    "Incent helps you ace your next job interview with AI-generated questions, resume analysis, and real-time voice practice sessions powered by Hume AI.",
  keywords: [
    "interview prep",
    "AI interview",
    "mock interview",
    "resume analysis",
    "job interview practice",
    "AI questions",
    "voice interview",
  ],
  authors: [{ name: "Incent" }],
  creator: "Incent",
  metadataBase: new URL("https://incent.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://incent.vercel.app",
    siteName: "Incent",
    title: "Incent – AI-Powered Interview Prep",
    description:
      "Ace your next job interview with AI-generated questions, resume analysis, and voice practice sessions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Incent – AI-Powered Interview Prep",
    description:
      "Ace your next job interview with AI-generated questions, resume analysis, and voice practice sessions.",
    creator: "@incent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${outfitSans.variable} antialiased font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableColorScheme
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
