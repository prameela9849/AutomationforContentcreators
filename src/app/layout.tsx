import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorFlow AI — Smart Automation for Content Creators",
  description: "Centralized AI workspace for content creators with automated planning, video repurposing, publishing, analytics, sponsorships, thumbnails, and script generation.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/creatorflow-icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFFF0] text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
