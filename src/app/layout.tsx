import type { Metadata } from "next";
import Script from "next/script";
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
  metadataBase: new URL("https://katakenyere.hu"),
  title: {
    default: "Kata Kenyere – Kézműves pékség Pécsett",
    template: "%s – Kata Kenyere",
  },
  description:
    "Kézműves kovászos pékség Pécsett. Kovásszal kelesztett, kézzel formázott kenyerek és péksütemények – minden nap frissen sütve, előrendelésre. Pécs, Salakhegyi út 14.",
  keywords: [
    "kovászos kenyér Pécs",
    "kézműves pékség Pécs",
    "kovász pékség Pécs",
    "kenyér előrendelés Pécs",
    "friss kenyér Pécs",
    "kovászos péksütemény",
    "pékség Baranya",
    "természetes kovász",
    "adalékanyagmentes kenyér",
    "Kata Kenyere",
  ],
  authors: [{ name: "Kata Kenyere" }],
  creator: "Kata Kenyere",
  publisher: "Kata Kenyere",
  openGraph: {
    title: "Kata Kenyere – Kézműves kovászos pékség, Pécs",
    description:
      "Kovásszal kelesztett, kézzel formázott kenyerek minden nap frissen – előrendelésre. Pécs, Salakhegyi út 14.",
    locale: "hu_HU",
    type: "website",
    url: "https://katakenyere.hu",
    siteName: "Kata Kenyere",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Kata Kenyere – Kézműves pékség Pécsett" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kata Kenyere – Kézműves kovászos pékség, Pécs",
    description: "Kovásszal kelesztett, kézzel formázott kenyerek – előrendelésre.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://katakenyere.hu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Kata Kenyere",
  description:
    "Kézműves kovászos pékség Pécsett. Kovásszal kelesztett, kézzel formázott kenyerek és péksütemények előrendelésre.",
  url: "https://katakenyere.hu",
  telephone: "+36-30-936-2058",
  email: "kataleskovar@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Salakhegyi út 14.",
    addressLocality: "Pécs",
    postalCode: "7624",
    addressCountry: "HU",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],
  priceRange: "$$",
  servesCuisine: ["Kovászos kenyér", "Péksütemény", "Kézműves pékáru"],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "4",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://www.instagram.com/katakenyere",
    "https://www.facebook.com/katakenyere",
  ],
  hasMap: "https://maps.google.com/?q=Kata+Kenyere+P%C3%A9cs",
  image: "https://katakenyere.hu/images/logo.png",
  logo: "https://katakenyere.hu/images/logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-cream text-brown-dark">
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(localBusinessSchema)}
        </Script>
        {children}
      </body>
    </html>
  );
}
