import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/valasztas", "/osszesites", "/koszonjuk", "/api/"],
      },
    ],
    sitemap: "https://katakenyere.hu/sitemap.xml",
  };
}
