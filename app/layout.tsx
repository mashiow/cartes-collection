import type { Metadata } from "next";
import { Kalam } from "next/font/google";
import "./globals.css";

const handwritten = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-handwritten",
});

export const metadata: Metadata = {
  title: "Anetsuki - Jeu de cartes",
  description: "Collectionne, ouvre des boosters et échange tes cartes.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={handwritten.variable}>{children}</body>
    </html>
  );
}