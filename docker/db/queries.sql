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


select * from public.phrases where lang = 'en' order by random() limit 100;

with random_rows as (select
    *
from
    public.phrases
where
    lang = 'en'
order by random()
limit
    100)

select
    rr.*
from
    random_rows rr
left join
    stats s
on
    s.ph_id = rr.ph_id
order by
    (s.tries / s.failed_tries) nulls first
limit 5;

-- select * from public.phrases tablesample system()

select * from public.phrases where value = 'hello' and lang = 'en';
select * from public.phrases where value = 'привет' and lang = 'ru';

insert into public.phrases(lang, value) VALUES ($1, $2);

select * from public.translation where ph_1_id = $1::uuid and ph_2_id = $2::uuid or ph_2_id = $1::uuid and ph_1_id = $2::uuid;

insert into public.translation (ph_1_id, ph_2_id) VALUES ($1, $2);

select
    src.ph_id as src_id,
    src.value as src_value,
    src.lang as src_lang,
    tgt.ph_id as tgt_id,
    tgt.value as tgt_value,
    tgt.lang as tgt_lang
from
    public.phrases src
join
    public.translation tr
on
    src.ph_id in (tr.ph_1_id, tr.ph_2_id)
join
    public.phrases tgt
on
    tgt.ph_id in (tr.ph_1_id, tr.ph_2_id)
where
    src.lang = 'en' and
    src.ph_id != tgt.ph_id
order by src.value
limit $1 offset $2;