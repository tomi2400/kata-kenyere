create table if not exists public.napi_keszlet (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  termek_id uuid not null references public.termekek(id) on delete cascade,
  termek_nev text not null,
  egyseg text not null,
  extra_mennyiseg integer not null default 0 check (extra_mennyiseg >= 0),
  elkeszult_mennyiseg integer not null default 0 check (elkeszult_mennyiseg >= 0),
  megjegyzes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (datum, termek_id)
);

create index if not exists napi_keszlet_datum_idx on public.napi_keszlet (datum);
create index if not exists napi_keszlet_termek_id_idx on public.napi_keszlet (termek_id);

alter table public.napi_keszlet enable row level security;

create or replace function public.set_napi_keszlet_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_napi_keszlet_updated_at on public.napi_keszlet;
create trigger set_napi_keszlet_updated_at
before update on public.napi_keszlet
for each row execute function public.set_napi_keszlet_updated_at();
