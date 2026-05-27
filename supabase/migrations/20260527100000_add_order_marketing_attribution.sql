alter table public.rendelesek
  add column if not exists marketing_attribution jsonb not null default '{}'::jsonb,
  add column if not exists traffic_source text,
  add column if not exists traffic_medium text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists msclkid text,
  add column if not exists landing_page text,
  add column if not exists referrer text;

create index if not exists rendelesek_traffic_source_idx on public.rendelesek (traffic_source);
create index if not exists rendelesek_utm_campaign_idx on public.rendelesek (utm_campaign);
create index if not exists rendelesek_gclid_idx on public.rendelesek (gclid);
create index if not exists rendelesek_fbclid_idx on public.rendelesek (fbclid);
create index if not exists rendelesek_msclkid_idx on public.rendelesek (msclkid);
