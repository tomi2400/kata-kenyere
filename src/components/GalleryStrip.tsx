"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/DSC00042.JPG", h: 420, w: 360 },
  { src: "/images/DSC00043.JPG", h: 380, w: 300 },
  { src: "/images/DSC00045.JPG", h: 440, w: 380 },
  { src: "/images/DSC00044.JPG", h: 360, w: 300 },
  { src: "/images/DSC00039.JPG", h: 420, w: 340 },
  { src: "/images/DSC00043.JPG", h: 400, w: 320 },
  { src: "/images/DSC00042.JPG", h: 360, w: 300 },
  { src: "/images/DSC00044.JPG", h: 440, w: 360 },
];

const GAP = 12;

export default function GalleryStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);      // mindig 0..halfWidth között
  const rafRef = useRef<number>(0);
  const dragActive = useRef(false);
  const dragLastX = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // halfWidth kiszámítása miután a DOM renderelt
    const halfWidth = () => track.scrollWidth / 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      if (!dragActive.current && !reduced) {
        offsetRef.current += 0.35;
        const hw = halfWidth();
        if (hw > 0 && offsetRef.current >= hw) {
          offsetRef.current -= hw;
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Egérgörgő
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
      let next = offsetRef.current + e.deltaY * 0.6;
      next = ((next % hw) + hw) % hw;
      offsetRef.current = next;
      track.style.transform = `translateX(-${next}px)`;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragActive.current = true;
    dragLastX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragActive.current) return;
    const track = trackRef.current;
    if (!track) return;
    const hw = track.scrollWidth / 2;
    if (hw <= 0) return;
    const delta = dragLastX.current - e.clientX;
    dragLastX.current = e.clientX;
    let next = offsetRef.current + delta;
    next = ((next % hw) + hw) % hw;
    offsetRef.current = next;
    track.style.transform = `translateX(-${next}px)`;
  };

  const onPointerUp = () => { dragActive.current = false; };

  return (
    <div className="relative px-16 md:px-24">
      {/* Gradient maszk a széleken */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 md:w-44 bg-gradient-to-r from-[#fafaf8] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 md:w-44 bg-gradient-to-l from-[#fafaf8] to-transparent" />

      <div
        ref={wrapRef}
        className="cursor-grab overflow-hidden active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex items-end will-change-transform"
          style={{ width: "max-content", gap: GAP }}
        >
          {[0, 1].map((set) => (
            <div key={set} className="flex items-end" style={{ gap: GAP }}>
              {PHOTOS.map((img, i) => (
                <div
                  key={i}
                  className="relative shrink-0 overflow-hidden rounded-[18px]"
                  style={{ width: img.w, height: img.h }}
                >
                  <Image
                    src={img.src}
                    alt="Kata Kenyere"
                    fill
                    className="object-cover"
                    sizes="380px"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(40,20,10,0.15)] via-transparent to-transparent" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
