begin;

create table public.exam_access (
  email text primary key check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 320
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.normalize_exam_access_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

create trigger exam_access_normalize_email
before insert or update on public.exam_access
for each row
execute function public.normalize_exam_access_email();

alter table public.exam_access enable row level security;
alter table public.exam_access force row level security;

revoke all on public.exam_access from public, anon, authenticated;
grant select on public.exam_access to authenticated;
grant all on public.exam_access to service_role;

create policy "Read own exam access" on public.exam_access
for select to authenticated
using (email = lower(btrim(coalesce((select auth.jwt()) ->> 'email', ''))));

create or replace function public.has_exam_access()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.exam_access);
$$;

revoke all on function public.has_exam_access() from public, anon;
grant execute on function public.has_exam_access() to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'past_papers',
  'past_papers',
  false,
  52428800,
  array['application/pdf', 'application/zip']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Privileged readers can download past papers" on storage.objects;
create policy "Privileged readers can download past papers" on storage.objects
for select to authenticated
using (
  bucket_id = 'past_papers'
  and (select public.has_exam_access())
);

commit;
