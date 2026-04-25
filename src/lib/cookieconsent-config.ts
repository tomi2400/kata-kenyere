import type * as CookieConsent from "vanilla-cookieconsent";
import { logConsent } from "./consent-log";
import { loadGTM } from "./gtm";

function ensureGtag() {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer.push(args);
    });

  return window.gtag;
}

function updateGTMConsent(analyticsGranted: boolean, marketingGranted: boolean) {
  const gtag = ensureGtag();
  if (!gtag) return;

  gtag("consent", "update", {
    analytics_storage: analyticsGranted ? "granted" : "denied",
    ad_storage: marketingGranted ? "granted" : "denied",
    ad_user_data: marketingGranted ? "granted" : "denied",
    ad_personalization: marketingGranted ? "granted" : "denied",
  });
}

function applyConsent(categories: string[]) {
  const analyticsAccepted = categories.includes("analytics");
  const marketingAccepted = categories.includes("marketing");

  updateGTMConsent(analyticsAccepted, marketingAccepted);

  if (analyticsAccepted || marketingAccepted) {
    loadGTM();
  }
}

function getConsentAction(categories: string[]) {
  const analyticsAccepted = categories.includes("analytics");
  const marketingAccepted = categories.includes("marketing");

  if (analyticsAccepted && marketingAccepted) return "accept_all";
  if (!analyticsAccepted && !marketingAccepted) return "accept_necessary";

  return "custom";
}

function getConsentId(cookie: CookieConsent.CookieValue) {
  return cookie.consentId || cookie.revision?.toString() || "unknown";
}

function isFirstConsentEvent(cookie: CookieConsent.CookieValue) {
  return cookie.consentTimestamp === cookie.lastConsentTimestamp;
}

export const cookieConsentConfig: CookieConsent.CookieConsentConfig = {
  revision: 1,
  cookie: {
    name: "cc_cookie",
    expiresAfterDays: 182,
  },
  guiOptions: {
    consentModal: {
      layout: "box inline",
      position: "bottom left",
      equalWeightButtons: true,
    },
    preferencesModal: {
      layout: "box",
      equalWeightButtons: true,
    },
  },
  categories: {
    necessary: {
      enabled: true,
      readOnly: true,
    },
    analytics: {
      autoClear: {
        cookies: [
          { name: /^_ga/ },
          { name: "_gid" },
          { name: /^_clck/ },
          { name: /^_clsk/ },
          { name: "CLID" },
          { name: "ANONCHK" },
          { name: "MR" },
          { name: "SM" },
        ],
      },
    },
    marketing: {
      autoClear: {
        cookies: [
          { name: "_fbp" },
          { name: "_fbc" },
          { name: "fr" },
        ],
      },
    },
  },
  onFirstConsent: ({ cookie }) => {
    applyConsent(cookie.categories);

    logConsent({
      consent_id: getConsentId(cookie),
      categories: cookie.categories,
      action: getConsentAction(cookie.categories),
    });
  },
  onConsent: ({ cookie }) => {
    applyConsent(cookie.categories);
  },
  onChange: ({ cookie }) => {
    applyConsent(cookie.categories);

    if (isFirstConsentEvent(cookie)) return;

    logConsent({
      consent_id: getConsentId(cookie),
      categories: cookie.categories,
      action: "change",
    });
  },
  language: {
    default: "hu",
    translations: {
      hu: {
        consentModal: {
          title: "Sütiket használunk",
          description:
            "Weboldalunk sütiket használ a forgalom méréséhez és a hirdetések optimalizálásához. A szükséges sütik mindig aktívak, az analitikai és marketing sütiket pedig csak akkor kapcsoljuk be, ha engedélyezed őket.",
          acceptAllBtn: "Összes elfogadása",
          acceptNecessaryBtn: "Csak a szükségesek",
          showPreferencesBtn: "Beállítások kezelése",
        },
        preferencesModal: {
          title: "Sütibeállítások",
          acceptAllBtn: "Összes elfogadása",
          acceptNecessaryBtn: "Csak a szükségesek",
          savePreferencesBtn: "Beállítások mentése",
          closeIconLabel: "Bezárás",
          sections: [
            {
              title: "Sütik használata",
              description:
                'Sütiket használunk a weboldal működtetéséhez, a forgalom méréséhez és a hirdetések optimalizálásához. Az alábbiakban kiválaszthatod, mely süti-kategóriákat engedélyezed. Részletes tájékoztatást az <a href="/adatvedelmi">adatvédelmi nyilatkozatunkban</a> találsz.',
            },
            {
              title: "Feltétlenül szükséges sütik",
              description:
                "Ezek a sütik a weboldal alapvető működéséhez szükségesek. Nem kapcsolhatók ki.",
              linkedCategory: "necessary",
            },
            {
              title: "Statisztikai sütik",
              description:
                "Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalt. A Google Analytics 4 és a Microsoft Clarity szolgáltatásait használjuk a forgalomelemzéshez.",
              linkedCategory: "analytics",
            },
            {
              title: "Marketing sütik",
              description:
                "Ezek a sütik a hirdetések személyre szabásához és a konverziók méréséhez szükségesek. A Meta (Facebook/Instagram) Pixel szolgáltatását használjuk.",
              linkedCategory: "marketing",
            },
          ],
        },
      },
    },
  },
};
