begin;

create table public.reader_positions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  page_key text not null check (page_key ~ '^ch[0-9]{2}$'),
  section_id text check (section_id ~ '^sec-[0-9]+-[0-9]+$'),
  section_progress integer not null check (section_progress between 0 and 10000)
);

alter table public.reader_positions enable row level security;
alter table public.reader_positions force row level security;

revoke all on public.reader_positions from public, anon, authenticated;
grant select, insert, update on public.reader_positions to authenticated;

create policy "Read own position" on public.reader_positions for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Create own position" on public.reader_positions for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Update own position" on public.reader_positions for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

commit;
