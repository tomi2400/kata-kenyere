create table public.napi_termek_vevo_limit (
  rendeles_nap_id uuid not null references public.rendeles_napok(id) on delete cascade,
  termek_id uuid not null references public.termekek(id) on delete cascade,
  max_vevonkent integer not null check (max_vevonkent between 1 and 99),
  primary key (rendeles_nap_id, termek_id)
);

alter table public.napi_termek_vevo_limit enable row level security;

create index if not exists rendeles_tetelek_napi_vevo_limit_idx
on public.rendeles_tetelek (rendeles_nap_id, termek_id);

-- A vevői limitet a rendelés mentésekor, tranzakción belül is ellenőrizzük.
-- Az azonos e-mail címmel párhuzamosan leadott rendelések sorba állnak.
create or replace function public.ellenoriz_napi_vevo_limit()
returns trigger
language plpgsql
as $$
declare
  vevo_email text;
  napi_limit integer;
  korabbi_mennyiseg integer;
begin
  if new.termek_id is null or new.rendeles_nap_id is null or new.allapot = 'torolve' then
    return new;
  end if;

  select lower(trim(email)) into vevo_email
  from public.rendelesek where id = new.rendeles_id;

  if vevo_email is null or vevo_email = '' then
    return new;
  end if;

  select max_vevonkent into napi_limit
  from public.napi_termek_vevo_limit
  where rendeles_nap_id = new.rendeles_nap_id and termek_id = new.termek_id;

  if napi_limit is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    new.rendeles_nap_id::text || ':' || new.termek_id::text || ':' || vevo_email, 0
  ));

  select coalesce(sum(t.mennyiseg), 0) into korabbi_mennyiseg
  from public.rendeles_tetelek t
  join public.rendelesek r on r.id = t.rendeles_id
  where t.rendeles_nap_id = new.rendeles_nap_id
    and t.termek_id = new.termek_id
    and lower(trim(r.email)) = vevo_email
    and t.allapot <> 'torolve'
    and r.allapot <> 'torolve'
    and t.id is distinct from new.id;

  if korabbi_mennyiseg + new.mennyiseg > napi_limit then
    raise exception 'customer_product_limit_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger ellenoriz_napi_vevo_limit_trigger
before insert or update of mennyiseg, termek_id, rendeles_nap_id, allapot
on public.rendeles_tetelek
for each row execute function public.ellenoriz_napi_vevo_limit();
