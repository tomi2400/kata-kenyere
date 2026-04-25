import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kata Kenyere – Kézműves pékség Pécsett";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#3D2314",
        }}
      >
        {/* Hero fotó */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://katakenyere.hu/images/termek-placeholder.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(61,35,20,0.95) 0%, rgba(61,35,20,0.55) 50%, rgba(61,35,20,0.2) 100%)",
          }}
        />

        {/* Tartalom */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 72,
            right: 72,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Tag */}
          <div
            style={{
              display: "flex",
              color: "#C9A96E",
              fontSize: 18,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            Kézműves pékség · Pécs
          </div>

          {/* Főcím */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#F5EDD9",
              fontSize: 72,
              fontFamily: "Georgia, serif",
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            <span>Frissen,</span>
            <span style={{ color: "#C9A96E", fontStyle: "italic" }}>kézzel,</span>
            <span>szeretettel.</span>
          </div>

          {/* Alcím */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              color: "rgba(245,237,217,0.7)",
              fontSize: 22,
              fontFamily: "sans-serif",
              lineHeight: 1.35,
              marginTop: 8,
            }}
          >
            <span>Kovásszal kelesztett kenyerek és kézzel formázott pékáruk</span>
            <span>minden nap frissen sütve, természetes alapanyagokból.</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
