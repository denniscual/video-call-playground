import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video Call Playground",
  description: "Real-time video conferencing platform. Connect with colleagues and clients through high-quality video calls, screen sharing, and collaborative meetings.",
  keywords: ["video call", "video conferencing", "online meetings", "screen sharing", "collaboration"],
  authors: [{ name: "Video Call Playground" }],
  creator: "Video Call Playground",
  publisher: "Video Call Playground",
  applicationName: "Video Call Playground",
  openGraph: {
    title: "Video Call Playground",
    description: "Real-time video conferencing platform. Connect with colleagues and clients through high-quality video calls, screen sharing, and collaborative meetings.",
    type: "website",
    siteName: "Video Call Playground",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Call Playground",
    description: "Real-time video conferencing platform. Connect with colleagues and clients through high-quality video calls, screen sharing, and collaborative meetings.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex justify-between items-center p-4 border-b">
              <div>
                <Link href="/">
                  <h1 className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors">Video Call Playground</h1>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <SignedOut>
                  <Link 
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign in
                  </Link>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </header>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
