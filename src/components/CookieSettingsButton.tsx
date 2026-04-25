"use client";

import * as CookieConsent from "vanilla-cookieconsent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => CookieConsent.showPreferences()}
      aria-label="Sütibeállítások megnyitása"
      className="block text-left text-[0.82rem] text-[#e8d6c0] transition-colors hover:text-white"
    >
      Sütibeállítások
    </button>
  );
}
