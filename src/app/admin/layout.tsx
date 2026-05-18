import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "../globals.css";

export const sansFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata:Metadata = {
  title: 'Chuchu - Panel de Control',
  description: 'Gestión de ventas y combos para tu negocio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" className={`${sansFont.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
