drop table if exists public.phrases;
drop table if exists public.translation;

create table if not exists public.phrases
(
    ph_id uuid default gen_random_uuid() primary key,
    lang char(2),
    value varchar,
    unique (lang, value)
);

create table if not exists public.translation (
    t_id uuid default gen_random_uuid() primary key,
    ph_1_id uuid not null,
    ph_2_id uuid not null
);

-- Fill with data

insert into public.phrases(ph_id, lang, value)
values ('071d3d5b-e396-46c9-9887-c8b71d810b3a', 'en', 'hello'),
       ('6b252ba0-edb9-4418-921e-6e1cc12a8bf9', 'en', 'bridge'),
       ('dc2dda45-5882-415f-b951-b27850e67949', 'ru', 'привет'),
       ('b228ea47-5abb-448c-8805-7bc8e016f2cc', 'ru', 'здравствуйте'),
       ('5e36b21b-d6d0-47c5-9446-7c5a69d8d0cb', 'ru', 'мост');

insert into public.translation(t_id, ph_1_id, ph_2_id)
values ('0bf09eca-ad43-440d-bf3b-540b4dee4f80', '071d3d5b-e396-46c9-9887-c8b71d810b3a', 'dc2dda45-5882-415f-b951-b27850e67949'),
       ('f9b23294-e7bb-45aa-a360-43303baed291', '071d3d5b-e396-46c9-9887-c8b71d810b3a', 'b228ea47-5abb-448c-8805-7bc8e016f2cc'),
       ('be50170e-3fd9-4bf7-a7ae-2a43ef395f7d', '6b252ba0-edb9-4418-921e-6e1cc12a8bf9', '5e36b21b-d6d0-47c5-9446-7c5a69d8d0cb');