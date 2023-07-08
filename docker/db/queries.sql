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

