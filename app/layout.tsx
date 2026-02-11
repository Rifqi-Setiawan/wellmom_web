import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "WellMom - Platform Kesehatan Ibu Hamil",
  description: "Platform monitoring dan konsultasi kesehatan untuk ibu hamil dengan perawat profesional",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/assets/images/Logo-Wellmom-Biru.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/images/Logo-Wellmom-Biru.png' },
    ],
  },
  openGraph: {
    title: "WellMom - Platform Kesehatan Ibu Hamil",
    description: "Platform monitoring dan konsultasi kesehatan untuk ibu hamil dengan perawat profesional",
    images: ['/assets/images/Logo-Wellmom-Biru.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}