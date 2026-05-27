# PPC tracking es dataLayer szerzodes

Ez a dokumentum a weboldal oldali tracking reteget irja le. A GA4, Meta Pixel, Google Ads es Clarity tagek a GTM kontenerben legyenek bekotve, a weboldal pedig csak tiszta `dataLayer` esemenyeket kuld.

## Alapelvek

- PII nem megy a `dataLayer`-be: nev, email, telefon es megjegyzes nincs event payloadban.
- A fo konverzio a `purchase` esemeny, `transaction_id` alapu deduplikacioval.
- A rendeles melle mentjuk a PPC attribucio adatait, hogy kesobb admin riportot lehessen epiteni ra.
- GA4 es Clarity csak analytics consent utan fusson.
- Meta Pixel es Google Ads remarketing/conversion csak marketing consent utan fusson.

## Attribucio

A globalis `MarketingAttributionTracker` minden oldalbetolteskor megnezi az URL-t es eltarolja:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `gclid`, `fbclid`, `msclkid`
- `landing_page`
- `referrer`
- `traffic_source`, `traffic_medium`
- `first_touch`, `last_touch`

Tarolas:

- `localStorage.kata_kenyere_first_touch`
- `localStorage.kata_kenyere_last_touch`

Rendeleskor ezek bemennek az `/api/rendeles` payloadba `marketingAttribution` alatt, majd a `rendelesek` tabla mezoi koze.

## Kozos dataLayer mezok

Minden esemeny tartalmazza:

```js
{
  event: "event_name",
  event_id: "event_name:timestamp:random",
  event_time: "2026-05-27T10:00:00.000Z",
  tracking_schema_version: "2026-05-27",
  marketing_attribution: {
    first_touch: {},
    last_touch: {}
  },
  traffic_source: "google",
  traffic_medium: "cpc",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "pecs_kovaszos_kenyer",
  utm_content: "hero_v1",
  utm_term: "kovaszos kenyer pecs",
  gclid: "...",
  fbclid: null,
  msclkid: null
}
```

## Funnel esemenyek

### `cta_clicked`

CTA kattintasok, peldaul hero, nav vagy final CTA.

Fontos mezok:

- `href`
- `cta_location`
- `cta_label`

GTM javaslat:

- GA4 event: `cta_clicked`
- Meta: nem kell kulon eventkent kuldeni
- Google Ads: nem conversion

### `product_preorder_clicked`

Termekkartya kattintas a kinalati oldalrol az elorendelesre.

Fontos mezok:

- `product_id`
- `product_name`
- `item_category`
- `price`
- `currency`
- `cta_location`

GTM javaslat:

- GA4 event: `select_item`
- Meta: opcionálisan `ViewContent`

### `preorder_started`

A felhasznalo kivalasztotta az atveteli napot es tovabblep a termekvalasztasra.

Fontos mezok:

- `selected_pickup_days_count`
- `pickup_dates`
- `pickup_days`

GTM javaslat:

- GA4 event: `preorder_started`
- Meta: opcionálisan `InitiateCheckout`, ha eleg eros jelnek tekintjuk

### `pickup_date_selected`

Az atveteli nap kivalasztasanak kulon meropontja.

Fontos mezok:

- `selected_pickup_days_count`
- `pickup_dates`
- `pickup_days`

GTM javaslat:

- GA4 event: `pickup_date_selected`

### `product_added`

Termek hozzaadasa a rendeléshez.

Fontos mezok:

- `product_id`
- `product_name`
- `item_category`
- `pickup_date`
- `quantity`
- `quantity_delta`
- `value`
- `currency`
- `ecommerce.items`

GTM javaslat:

- GA4 event: `add_to_cart`
- Meta event: `AddToCart`

### `product_quantity_changed`

Termek mennyisegenek csokkentese vagy modositasa.

Fontos mezok:

- `product_id`
- `product_name`
- `previous_quantity`
- `quantity`
- `quantity_delta`
- `value`
- `currency`

GTM javaslat:

- GA4 event: `product_quantity_changed`

### `checkout_started`

Az osszesito oldalra tovabblepes, amikor mar van rendelheto kosar.

Fontos mezok:

- `value`
- `currency`
- `pickup_days_count`
- `pickup_dates`
- `order_items_count`
- `ecommerce.items`

GTM javaslat:

- GA4 event: `begin_checkout`
- Meta event: `InitiateCheckout`

### `order_submitted`

A rendeles kuldese az API fele. Ez meg nem vegleges konverzio.

Fontos mezok:

- `value`
- `currency`
- `pickup_days_count`
- `order_items_count`
- `ecommerce.items`

GTM javaslat:

- GA4 event: `order_submitted`
- Ne legyen Google Ads vagy Meta Purchase.

### `purchase`

Sikeres API-valasz utan, amikor a rendelesszam mar megvan.

Fontos mezok:

- `transaction_id`
- `event_id`: `purchase:{transaction_id}`
- `value`
- `currency`
- `pickup_days_count`
- `pickup_dates`
- `order_items_count`
- `ecommerce.transaction_id`
- `ecommerce.items`

GTM javaslat:

- GA4 event: `purchase`
- Google Ads conversion: fo konverzio
- Meta event: `Purchase`
- Meta CAPI kesobb ugyanezzel az `event_id` ertekkel deduplikalhato

## GTM consent routing

Javasolt tag feltetelek:

| Tag | Consent |
| --- | --- |
| GA4 config/event | `analytics_storage = granted` |
| Clarity | analytics consent |
| Google Ads conversion | `ad_storage = granted`, `ad_user_data = granted` |
| Meta Pixel | marketing consent |

Clarityben a rendelési urlap mezoi legyenek maszkolva.
