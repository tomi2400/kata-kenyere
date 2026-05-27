"use client";

import { useEffect } from "react";
import { captureMarketingAttribution } from "@/lib/tracking";

export default function MarketingAttributionTracker() {
  useEffect(() => {
    captureMarketingAttribution();
  }, []);

  return null;
}
