begin;

create table public.reader_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page_key text not null check (char_length(page_key) between 1 and 100),
  anchor jsonb not null check (
    jsonb_typeof(anchor) = 'object'
    and anchor ?& array['quote', 'prefix', 'suffix', 'start', 'end']
    and jsonb_typeof(anchor->'quote') = 'string'
    and char_length(anchor->>'quote') between 1 and 50000
    and jsonb_typeof(anchor->'prefix') = 'string'
    and jsonb_typeof(anchor->'suffix') = 'string'
    and char_length(anchor->>'prefix') <= 64
    and char_length(anchor->>'suffix') <= 64
    and jsonb_typeof(anchor->'start') = 'number'
    and jsonb_typeof(anchor->'end') = 'number'
    and (anchor->>'start')::integer >= 0
    and (anchor->>'end')::integer > (anchor->>'start')::integer
  ),
  color text not null check (color in ('peach', 'lavender', 'ice-blue', 'mint')),
  created_at timestamptz not null default now()
);

create index reader_highlights_owner_created on public.reader_highlights (user_id, created_at desc, id);
-- Index a fixed-size digest because a long selected passage can exceed the index key limit.
create unique index reader_highlights_owner_passage on public.reader_highlights (user_id, page_key, md5(anchor::text));

alter table public.reader_highlights enable row level security;
alter table public.reader_highlights force row level security;

revoke all on public.reader_highlights from public, anon, authenticated;
grant select, delete on public.reader_highlights to authenticated;
grant insert (user_id, page_key, anchor, color), update (color) on public.reader_highlights to authenticated;

create policy "Read own reader highlights" on public.reader_highlights for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Create own reader highlights" on public.reader_highlights for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Recolor own reader highlights" on public.reader_highlights for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own reader highlights" on public.reader_highlights for delete to authenticated
using ((select auth.uid()) = user_id);

commit;
