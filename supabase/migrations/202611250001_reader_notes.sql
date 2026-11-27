begin;

create table public.reader_notes (
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
  body text not null check (char_length(btrim(body)) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reader_notes_owner_page on public.reader_notes (user_id, page_key, created_at desc);

alter table public.reader_notes enable row level security;
alter table public.reader_notes force row level security;

revoke all on public.reader_notes from public, anon;
grant select, insert, update, delete on public.reader_notes to authenticated;

create policy "Read own reader notes" on public.reader_notes for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Create own reader notes" on public.reader_notes for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Edit own reader notes" on public.reader_notes for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own reader notes" on public.reader_notes for delete to authenticated
using ((select auth.uid()) = user_id);

create function public.set_reader_note_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_reader_note_updated_at() from public, anon, authenticated;
create trigger reader_notes_updated_at before update on public.reader_notes
for each row execute function public.set_reader_note_updated_at();

commit;
