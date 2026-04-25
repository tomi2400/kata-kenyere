const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

let gtmLoaded = false;

export function loadGTM() {
  if (gtmLoaded || !GTM_ID || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);

  gtmLoaded = true;
}
