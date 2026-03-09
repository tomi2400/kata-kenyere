"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function ScrollReveal({
  children,
  delay,
  className = "",
}: {
  children: ReactNode;
  delay?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${delay ? ` reveal-d${delay}` : ""} ${className}`}
    >
      {children}
    </div>
  );
}
