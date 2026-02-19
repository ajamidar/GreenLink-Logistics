// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Link Logistics",
  description: "Smart Route Optimization Dashboard",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32" },
        { url: "/logo.png", sizes: "192x192" },
    ],
  },
};

// Inside src/app/layout.tsx

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}