import type { Metadata, Viewport } from "next";
import { Anek_Bangla } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const anekBangla = Anek_Bangla({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-anek-bangla",
});

export const viewport: Viewport = {
  themeColor: "#F43F5E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "মুডসিঙ্ক — Couples Mood App",
  description: "মুড লুকানোর জন্য নয়। মুড বোঝার জন্য। ❤️",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "মুডসিঙ্ক",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${anekBangla.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[var(--background)] text-[var(--foreground)] selection:bg-rose-100 selection:text-rose-900">
        <ServiceWorkerRegister />
        <PwaInstallPrompt />
        {children}
      </body>
    </html>
  );
}
