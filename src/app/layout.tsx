import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kata Kenyere – Kézműves kovászos pékség, Pécs",
  description:
    "Kovásszal kelesztve, kézzel formázva, minden nap frissen sütve. Rendeld meg előre kedvenc pékárudat! Pécs, Salakhegyi út 14.",
  openGraph: {
    title: "Kata Kenyere – Kézműves kovászos pékség",
    description: "Mindent frissen, kézzel készítünk. Előrendelés online.",
    locale: "hu_HU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-cream text-brown-dark">
        {children}
      </body>
    </html>
  );
}
