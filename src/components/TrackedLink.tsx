"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { pushDataLayerEvent } from "@/lib/tracking";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  trackingEvent?: string;
  trackingData?: Record<string, unknown>;
};

function getHrefLabel(href: TrackedLinkProps["href"]) {
  if (typeof href === "string") return href;
  return href.pathname || "unknown";
}

export default function TrackedLink({
  trackingEvent = "cta_clicked",
  trackingData = {},
  onClick,
  href,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        pushDataLayerEvent(trackingEvent, {
          href: getHrefLabel(href),
          ...trackingData,
        });
        onClick?.(event);
      }}
      {...props}
    />
  );
}
