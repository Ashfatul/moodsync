import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-hind-siliguri",
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
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
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
    <html lang="bn" className={`${hindSiliguri.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[var(--background)] text-[var(--foreground)] selection:bg-rose-100 selection:text-rose-900">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
