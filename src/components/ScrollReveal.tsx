"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale" | "soft";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user's motion preference — leave element fully visible
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Enable animation (hides element via CSS); must happen before observer fires
    el.classList.add("sr-animate");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("sr-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`sr-${variant} ${className}`}>
      {children}
    </div>
  );
}
