const FIRST_TOUCH_KEY = "kata_kenyere_first_touch";
const LAST_TOUCH_KEY = "kata_kenyere_last_touch";
const TRACKING_SCHEMA_VERSION = "2026-05-27";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_ID_PARAMS = ["gclid", "fbclid", "msclkid"] as const;

type UtmParam = (typeof UTM_PARAMS)[number];
type ClickIdParam = (typeof CLICK_ID_PARAMS)[number];

export type MarketingTouch = {
  captured_at: string;
  landing_page: string;
  page_path: string;
  referrer: string | null;
  traffic_source: string;
  traffic_medium: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
};

export type MarketingAttribution = {
  first_touch: MarketingTouch | null;
  last_touch: MarketingTouch | null;
};

type TrackingOptions = {
  eventId?: string;
};

function cleanString(value: unknown, maxLength = 240): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function getParam(params: URLSearchParams, name: UtmParam | ClickIdParam): string | null {
  return cleanString(params.get(name));
}

function getExternalReferrer(referrer: string, currentOrigin: string): string | null {
  const cleaned = cleanString(referrer, 700);
  if (!cleaned) return null;

  try {
    const referrerUrl = new URL(cleaned);
    return referrerUrl.origin === currentOrigin ? null : cleaned;
  } catch {
    return null;
  }
}

function getReferrerHost(referrer: string | null): string | null {
  if (!referrer) return null;

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function hasPaidOrCampaignSignal(params: URLSearchParams, referrer: string | null): boolean {
  return (
    UTM_PARAMS.some((param) => Boolean(params.get(param))) ||
    CLICK_ID_PARAMS.some((param) => Boolean(params.get(param))) ||
    Boolean(referrer)
  );
}

function buildMarketingTouch(url: URL, referrer: string | null): MarketingTouch {
  const params = url.searchParams;
  const utmSource = getParam(params, "utm_source");
  const utmMedium = getParam(params, "utm_medium");
  const gclid = getParam(params, "gclid");
  const fbclid = getParam(params, "fbclid");
  const msclkid = getParam(params, "msclkid");
  const referrerHost = getReferrerHost(referrer);
  const hasClickId = Boolean(gclid || fbclid || msclkid);

  const trafficSource =
    utmSource ||
    (gclid ? "google" : null) ||
    (fbclid ? "facebook" : null) ||
    (msclkid ? "microsoft" : null) ||
    referrerHost ||
    "direct";

  const trafficMedium =
    utmMedium ||
    (gclid ? "cpc" : null) ||
    (fbclid ? "paid_social" : null) ||
    (msclkid ? "cpc" : null) ||
    (referrerHost ? "referral" : null) ||
    (hasClickId ? "cpc" : "direct");

  return {
    captured_at: new Date().toISOString(),
    landing_page: `${url.pathname}${url.search}`.slice(0, 700),
    page_path: url.pathname.slice(0, 240),
    referrer,
    traffic_source: trafficSource,
    traffic_medium: trafficMedium,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: getParam(params, "utm_campaign"),
    utm_content: getParam(params, "utm_content"),
    utm_term: getParam(params, "utm_term"),
    gclid,
    fbclid,
    msclkid,
  };
}

function readStoredTouch(key: string): MarketingTouch | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    return sanitizeMarketingTouch(JSON.parse(value));
  } catch {
    return null;
  }
}

function writeStoredTouch(key: string, touch: MarketingTouch) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(touch));
  } catch {
    // Storage can be unavailable in private browsing; tracking should never block ordering.
  }
}

export function captureMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") {
    return { first_touch: null, last_touch: null };
  }

  const url = new URL(window.location.href);
  const referrer = getExternalReferrer(document.referrer, url.origin);
  const touch = buildMarketingTouch(url, referrer);
  const firstTouch = readStoredTouch(FIRST_TOUCH_KEY);
  const lastTouch = readStoredTouch(LAST_TOUCH_KEY);

  if (!firstTouch) {
    writeStoredTouch(FIRST_TOUCH_KEY, touch);
  }

  if (!lastTouch || hasPaidOrCampaignSignal(url.searchParams, referrer)) {
    writeStoredTouch(LAST_TOUCH_KEY, touch);
  }

  return getStoredMarketingAttribution();
}

export function getStoredMarketingAttribution(): MarketingAttribution {
  return {
    first_touch: readStoredTouch(FIRST_TOUCH_KEY),
    last_touch: readStoredTouch(LAST_TOUCH_KEY),
  };
}

export function getPrimaryMarketingTouch(attribution: MarketingAttribution | null): MarketingTouch | null {
  return attribution?.last_touch || attribution?.first_touch || null;
}

function sanitizeMarketingTouch(input: unknown): MarketingTouch | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Record<string, unknown>;

  const landingPage = cleanString(candidate.landing_page, 700);
  const pagePath = cleanString(candidate.page_path, 240);
  const capturedAt = cleanString(candidate.captured_at, 80);
  const trafficSource = cleanString(candidate.traffic_source, 120);
  const trafficMedium = cleanString(candidate.traffic_medium, 120);

  if (!landingPage || !pagePath || !capturedAt || !trafficSource || !trafficMedium) {
    return null;
  }

  return {
    captured_at: capturedAt,
    landing_page: landingPage,
    page_path: pagePath,
    referrer: cleanString(candidate.referrer, 700),
    traffic_source: trafficSource,
    traffic_medium: trafficMedium,
    utm_source: cleanString(candidate.utm_source, 240),
    utm_medium: cleanString(candidate.utm_medium, 240),
    utm_campaign: cleanString(candidate.utm_campaign, 240),
    utm_content: cleanString(candidate.utm_content, 240),
    utm_term: cleanString(candidate.utm_term, 240),
    gclid: cleanString(candidate.gclid, 240),
    fbclid: cleanString(candidate.fbclid, 240),
    msclkid: cleanString(candidate.msclkid, 240),
  };
}

export function sanitizeMarketingAttribution(input: unknown): MarketingAttribution | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Record<string, unknown>;
  const attribution = {
    first_touch: sanitizeMarketingTouch(candidate.first_touch),
    last_touch: sanitizeMarketingTouch(candidate.last_touch),
  };

  if (!attribution.first_touch && !attribution.last_touch) return null;
  return attribution;
}

function buildEventId(eventName: string) {
  return `${eventName}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function getAttributionEventFields(attribution: MarketingAttribution) {
  const primaryTouch = getPrimaryMarketingTouch(attribution);

  return {
    tracking_schema_version: TRACKING_SCHEMA_VERSION,
    marketing_attribution: attribution,
    traffic_source: primaryTouch?.traffic_source ?? null,
    traffic_medium: primaryTouch?.traffic_medium ?? null,
    utm_source: primaryTouch?.utm_source ?? null,
    utm_medium: primaryTouch?.utm_medium ?? null,
    utm_campaign: primaryTouch?.utm_campaign ?? null,
    utm_content: primaryTouch?.utm_content ?? null,
    utm_term: primaryTouch?.utm_term ?? null,
    gclid: primaryTouch?.gclid ?? null,
    fbclid: primaryTouch?.fbclid ?? null,
    msclkid: primaryTouch?.msclkid ?? null,
  };
}

export function pushDataLayerEvent(
  eventName: string,
  payload: Record<string, unknown> = {},
  options: TrackingOptions = {}
) {
  if (typeof window === "undefined") return;

  const attribution = captureMarketingAttribution();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    event_id: options.eventId || buildEventId(eventName),
    event_time: new Date().toISOString(),
    ...getAttributionEventFields(attribution),
    ...payload,
  });
}
