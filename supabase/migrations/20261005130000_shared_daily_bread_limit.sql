-- Csak új beállítást és ellenőrzést adunk hozzá; meglévő rendeléseket nem írunk át.
create table if not exists public.napi_kenyer_vevo_limit (
  rendeles_nap_id uuid primary key references public.rendeles_napok(id) on delete cascade,
  max_vevonkent integer not null check (max_vevonkent between 1 and 99)
);

alter table public.napi_kenyer_vevo_limit enable row level security;

create or replace function public.ellenoriz_napi_kenyer_limit()
returns trigger
language plpgsql
as $$
declare
  vevo_email text;
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

  select lower(btrim(email)) into vevo_email
  from public.rendelesek where id = new.rendeles_id;

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

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.rendeles_tetelek'::regclass
      and tgname = 'ellenoriz_napi_kenyer_limit_trigger'
      and not tgisinternal
  ) then
    create trigger ellenoriz_napi_kenyer_limit_trigger
    after insert or update of mennyiseg, termek_id, rendeles_nap_id, allapot
    on public.rendeles_tetelek
    for each row execute function public.ellenoriz_napi_kenyer_limit();
  end if;
end;
$$;
