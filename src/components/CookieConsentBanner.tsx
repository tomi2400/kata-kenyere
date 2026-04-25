"use client";

import { useEffect } from "react";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import "@/styles/cookieconsent-custom.css";
import * as CookieConsent from "vanilla-cookieconsent";
import { cookieConsentConfig } from "@/lib/cookieconsent-config";

let cookieConsentInitialized = false;

export default function CookieConsentBanner() {
  useEffect(() => {
    if (cookieConsentInitialized) return;

    cookieConsentInitialized = true;
    CookieConsent.run(cookieConsentConfig);
  }, []);

  return null;
}
