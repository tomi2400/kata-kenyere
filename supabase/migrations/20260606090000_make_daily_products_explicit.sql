insert into public.napi_termekek (rendeles_nap_id, termek_id)
select rendeles_nap.id, termek.id
from public.rendeles_napok as rendeles_nap
cross join public.termekek as termek
where rendeles_nap.nyitott = true
  and rendeles_nap.datum >= current_date
  and termek.aktiv = true
  and not exists (
    select 1
    from public.napi_termekek as napi_termek
    where napi_termek.rendeles_nap_id = rendeles_nap.id
  )
on conflict do nothing;
