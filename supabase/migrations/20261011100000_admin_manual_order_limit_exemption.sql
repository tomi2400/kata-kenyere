-- A hitelesített péki/admin rendeléseket megjelöljük, hogy a pék többek között
-- viszonteladói mennyiségeket is rögzíthessen a vevői limitektől függetlenül.
alter table public.rendelesek
add column if not exists vevo_limit_kivetel boolean not null default false;

create or replace function public.ellenoriz_napi_vevo_limit()
returns trigger
language plpgsql
as $$
declare
  vevo_email text;
  limit_kivetel boolean;
  napi_limit integer;
  korabbi_mennyiseg integer;
begin
  if new.termek_id is null or new.rendeles_nap_id is null or new.allapot = 'torolve' then
    return new;
  end if;

  select lower(trim(email)), vevo_limit_kivetel into vevo_email, limit_kivetel
  from public.rendelesek where id = new.rendeles_id;

  if coalesce(limit_kivetel, false) then
    return new;
  end if;

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
    and not coalesce(r.vevo_limit_kivetel, false)
    and t.allapot <> 'torolve'
    and r.allapot <> 'torolve'
    and t.id is distinct from new.id;

  if korabbi_mennyiseg + new.mennyiseg > napi_limit then
    raise exception 'customer_product_limit_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create or replace function public.ellenoriz_napi_kenyer_limit()
returns trigger
language plpgsql
as $$
declare
  vevo_email text;
  limit_kivetel boolean;
  napi_limit integer;
  osszes_kenyer integer;
begin
  if new.termek_id is null or new.rendeles_nap_id is null or new.allapot = 'torolve' then
    return new;
  end if;

  -- A pékek által végzett státuszváltást vagy mennyiségcsökkentést nem blokkoljuk.
  if tg_op = 'UPDATE'
    and new.rendeles_nap_id is not distinct from old.rendeles_nap_id
    and new.termek_id is not distinct from old.termek_id
    and new.mennyiseg <= old.mennyiseg
    and (old.allapot <> 'torolve' or new.allapot = 'torolve') then
    return new;
  end if;

  if not exists (
    select 1 from public.termekek p
    where p.id = new.termek_id
      and p.kategoria in (
        'Kovászos kenyerek',
        'Ízesített kovászos kenyerek',
        'Rozsos és teljes kiőrlésű kenyerek'
      )
      and lower(p.nev) not like '%bagett%'
  ) then
    return new;
  end if;

  select max_vevonkent into napi_limit
  from public.napi_kenyer_vevo_limit
  where rendeles_nap_id = new.rendeles_nap_id;

  if napi_limit is null then
    return new;
  end if;

  select lower(btrim(email)), vevo_limit_kivetel into vevo_email, limit_kivetel
  from public.rendelesek where id = new.rendeles_id;

  if coalesce(limit_kivetel, false) then
    return new;
  end if;

  if vevo_email is null or vevo_email = '' then
    return new;
  end if;

  -- Azonos nap és e-mail esetén a párhuzamos kenyérrendeléseket sorba állítjuk.
  perform pg_advisory_xact_lock(hashtextextended(
    new.rendeles_nap_id::text || ':kenyerek:' || vevo_email, 0
  ));

  -- AFTER trigger: az ugyanabban a kérésben beszúrt összes kenyérsort látja.
  select coalesce(sum(t.mennyiseg), 0) into osszes_kenyer
  from public.rendeles_tetelek t
  join public.rendelesek r on r.id = t.rendeles_id
  join public.termekek p on p.id = t.termek_id
  where t.rendeles_nap_id = new.rendeles_nap_id
    and lower(btrim(r.email)) = vevo_email
    and not coalesce(r.vevo_limit_kivetel, false)
    and t.allapot <> 'torolve'
    and r.allapot <> 'torolve'
    and p.kategoria in (
      'Kovászos kenyerek',
      'Ízesített kovászos kenyerek',
      'Rozsos és teljes kiőrlésű kenyerek'
    )
    and lower(p.nev) not like '%bagett%';

  if osszes_kenyer > napi_limit then
    raise exception 'customer_bread_limit_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;
