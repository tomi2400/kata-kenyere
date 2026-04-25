"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/DSC00042.JPG", aspect: 360 / 420 },
  { src: "/images/DSC00043.JPG", aspect: 300 / 380 },
  { src: "/images/DSC00045.JPG", aspect: 380 / 440 },
  { src: "/images/DSC00044.JPG", aspect: 300 / 360 },
  { src: "/images/DSC00039.JPG", aspect: 340 / 420 },
  { src: "/images/DSC00043.JPG", aspect: 320 / 400 },
  { src: "/images/DSC00042.JPG", aspect: 300 / 360 },
  { src: "/images/DSC00044.JPG", aspect: 360 / 440 },
];

// Mobilon kisebb, asztali gépen nagyobb képmagasság
const IMG_H_MOBILE = 200;
const IMG_H_DESKTOP = 380;
const GAP = 10;

export default function GalleryStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Momentum/touch state
  const pointerActive = useRef(false);
  const pointerLastX = useRef(0);
  const velocityRef = useRef(0);
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const halfWidth = () => track.scrollWidth / 2;

    const clamp = (v: number) => {
      const hw = halfWidth();
      if (hw <= 0) return 0;
      return ((v % hw) + hw) % hw;
    };

    const AUTO_SPEED = 0.5;
    const FRICTION = 0.92;

    const tick = () => {
      if (!reduced) {
        if (!pointerActive.current) {
          // Lassuljon le a lendület, majd folytassa az auto-scrollt
          if (Math.abs(velocityRef.current) > 0.05) {
            velocityRef.current *= FRICTION;
            offsetRef.current = clamp(offsetRef.current + velocityRef.current);
          } else {
            velocityRef.current = 0;
            offsetRef.current = clamp(offsetRef.current + AUTO_SPEED);
          }
          track.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Egérgörgő (csak asztali)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;
      const hw = track.scrollWidth / 2;
      if (hw <= 0) return;
      let next = offsetRef.current + e.deltaY * 0.5;
      next = ((next % hw) + hw) % hw;
      offsetRef.current = next;
      velocityRef.current = 0;
      track.style.transform = `translateX(-${next}px)`;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerActive.current = true;
    pointerLastX.current = e.clientX;
    velocityRef.current = 0;
    lastMoveTime.current = e.timeStamp;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointerActive.current) return;
    const track = trackRef.current;
    if (!track) return;
    const hw = track.scrollWidth / 2;
    if (hw <= 0) return;

    const delta = pointerLastX.current - e.clientX;
    const dt = Math.max(e.timeStamp - lastMoveTime.current, 1);

    // Lendület kiszámítása (px/ms → px/frame @60fps ≈ 16ms)
    velocityRef.current = (delta / dt) * 16;

    pointerLastX.current = e.clientX;
    lastMoveTime.current = e.timeStamp;

    let next = offsetRef.current + delta;
    next = ((next % hw) + hw) % hw;
    offsetRef.current = next;
    track.style.transform = `translateX(-${next}px)`;
  };

  const onPointerUp = () => {
    pointerActive.current = false;
  };

  return (
    <div className="relative">
      {/* Gradient maszk a széleken */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 md:w-44 bg-gradient-to-r from-[#fafaf8] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 md:w-44 bg-gradient-to-l from-[#fafaf8] to-transparent" />

      <div
        ref={wrapRef}
        className="cursor-grab overflow-hidden active:cursor-grabbing select-none touch-pan-y"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex items-end will-change-transform"
          style={{ width: "max-content", gap: GAP }}
        >
          {[0, 1].map((set) => (
            <div key={set} className="flex items-end" style={{ gap: GAP }}>
              {PHOTOS.map((img, i) => {
                const mobileW = Math.round(IMG_H_MOBILE * img.aspect);
                const desktopW = Math.round(IMG_H_DESKTOP * img.aspect);
                return (
                  <div
                    key={i}
                    className="relative shrink-0 overflow-hidden rounded-2xl"
                    style={{
                      // CSS clamp: mobilon kisebb, asztali gépen nagyobb
                      width: `clamp(${mobileW}px, ${desktopW / 14}vw, ${desktopW}px)`,
                      aspectRatio: `${img.aspect}`,
                    }}
                  >
                    <Image
                      src={img.src}
                      alt="Kata Kenyere"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 160px, 380px"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(40,20,10,0.15)] via-transparent to-transparent" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
