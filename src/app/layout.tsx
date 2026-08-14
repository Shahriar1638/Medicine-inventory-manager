import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/lib/store";
import Header from "@/components/Header";
import Toaster from "@/components/Toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Medix — Medicine Management & POS",
  description:
    "Pharmacy-point-of-sale and medicine inventory management. Browse, sell, and track invoices.",
};

const themeInitScript = `
try {
  var t = JSON.parse(localStorage.getItem('medshop.theme') || '"light"');
  if (t === 'dark') document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <AppProviders>
          <Header />
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}