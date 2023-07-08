select * from public.phrases where lang = 'en' limit 5;

select
    p1.ph_id as src_ph_id,
    p1.lang as src_lang,
    p1.value as src_value,
    p2.ph_id as tgt_ph_id,
    p2.lang as tgt_lang,
    p2.value as tgt_value
from
    public.translation t
join
    public.phrases p1
on
    t.ph_1_id = p1.ph_id
join
    public.phrases p2
on
    t.ph_2_id = p2.ph_id
where
    t.ph_1_id = '071d3d5b-e396-46c9-9887-c8b71d810b3a' and
    p2.lang = 'ru'
union
select
    p1.ph_id as src_ph_id,
    p1.lang as src_lang,
    p1.value as src_value,
    p2.ph_id as tgt_ph_id,
    p2.lang as tgt_lang,
    p2.value as tgt_value
from
    public.translation t
join
    public.phrases p1
on
    t.ph_2_id = p1.ph_id
join
    public.phrases p2
on
    t.ph_1_id = p2.ph_id
where
    t.ph_2_id = '071d3d5b-e396-46c9-9887-c8b71d810b3a' and
    p2.lang = 'ru';

select * from public.stats;

-- update statistics
-- failure
insert into public.stats (ph_id, target_language, tries, failed_tries)
values ('071d3d5b-e396-46c9-9887-c8b71d810b3a', 'ru', 1, 1)
on conflict (ph_id, target_language) do update
set
    tries = tries + 1,
    failed_tries = stats.failed_tries + 1,
    updated_at = current_timestamp;

-- success
insert into public.stats (ph_id, target_language, tries, failed_tries)
values ('071d3d5b-e396-46c9-9887-c8b71d810b3a', 'ru', 1, 0)
on conflict (ph_id, target_language) do update
set
    tries = stats.tries + 1,
    updated_at = current_timestamp;




insert into public.stats (ph_id, target_language, tries, failed_tries)
values ('071d3d5b-e396-46c9-9887-c8b71d810b3a', 'ru', 1, 1)

on conflict (ph_id, target_language) do update
    set
        tries = stats.tries + 1,
        failed_tries = stats.failed_tries + 1,
        updated_at = current_timestamp;

delete from public.stats where true;