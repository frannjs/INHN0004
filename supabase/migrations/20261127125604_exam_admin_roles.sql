begin;

alter table public.exam_access
  add column if not exists role text not null default 'privileged'
  check (role in ('privileged', 'admin'));

-- Keep RLS enabled for all client roles while letting postgres-owned SECURITY DEFINER
-- helpers evaluate role membership without policy recursion.
alter table public.exam_access enable row level security;
alter table public.exam_access no force row level security;

create schema if not exists exam_access_private;
revoke all on schema exam_access_private from public, anon, authenticated;
grant usage on schema exam_access_private to authenticated, service_role;

create or replace function exam_access_private.current_exam_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.exam_access
  where email = lower(btrim(coalesce((select auth.jwt()) ->> 'email', '')))
  limit 1;
$$;

revoke all on function exam_access_private.current_exam_role() from public, anon;
grant execute on function exam_access_private.current_exam_role() to authenticated, service_role;

create or replace function public.current_exam_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select exam_access_private.current_exam_role();
$$;

create or replace function public.has_exam_access()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(public.current_exam_role() in ('privileged', 'admin'), false);
$$;

create or replace function public.is_exam_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(public.current_exam_role() = 'admin', false);
$$;

revoke all on function public.current_exam_role() from public, anon;
revoke all on function public.has_exam_access() from public, anon;
revoke all on function public.is_exam_admin() from public, anon;
grant execute on function public.current_exam_role(), public.has_exam_access(), public.is_exam_admin()
  to authenticated, service_role;

revoke all on public.exam_access from public, anon, authenticated;
grant select, delete on public.exam_access to authenticated;
grant insert (email, role, note), update (role, note) on public.exam_access to authenticated;
grant all on public.exam_access to service_role;

drop policy if exists "Read own exam access" on public.exam_access;
drop policy if exists "Read own or admin read all exam access" on public.exam_access;
drop policy if exists "Admins grant exam access" on public.exam_access;
drop policy if exists "Admins update exam access" on public.exam_access;
drop policy if exists "Admins revoke exam access" on public.exam_access;

create policy "Read own or admin read all exam access" on public.exam_access
for select to authenticated
using (
  email = lower(btrim(coalesce((select auth.jwt()) ->> 'email', '')))
  or (select public.is_exam_admin())
);

create policy "Admins grant exam access" on public.exam_access
for insert to authenticated
with check ((select public.is_exam_admin()));

create policy "Admins update exam access" on public.exam_access
for update to authenticated
using ((select public.is_exam_admin()))
with check (
  (select public.is_exam_admin())
  and (
    email <> lower(btrim(coalesce((select auth.jwt()) ->> 'email', '')))
    or role = 'admin'
  )
);

create policy "Admins revoke exam access" on public.exam_access
for delete to authenticated
using (
  (select public.is_exam_admin())
  and email <> lower(btrim(coalesce((select auth.jwt()) ->> 'email', '')))
);

drop policy if exists "Admins can upload past papers" on storage.objects;
create policy "Admins can upload past papers" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'past_papers'
  and (select public.is_exam_admin())
);

drop policy if exists "Admins can replace past papers" on storage.objects;
create policy "Admins can replace past papers" on storage.objects
for update to authenticated
using (
  bucket_id = 'past_papers'
  and (select public.is_exam_admin())
)
with check (
  bucket_id = 'past_papers'
  and (select public.is_exam_admin())
);

commit;
