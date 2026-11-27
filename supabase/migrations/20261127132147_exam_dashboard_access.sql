begin;

create function exam_access_private.list_exam_users()
returns table (email text, role text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if exam_access_private.current_exam_role() is distinct from 'admin' then
    raise exception 'Only exam admins can list users' using errcode = '42501';
  end if;

  return query
    select accounts.email, coalesce(access.role, 'base')
    from (
      select lower(btrim(account.email)) as email
      from auth.users as account
      where nullif(btrim(account.email), '') is not null
      union
      select granted.email from public.exam_access as granted
    ) as accounts
    left join public.exam_access as access on access.email = accounts.email;
end;
$$;

revoke all on function exam_access_private.list_exam_users() from public, anon;
grant execute on function exam_access_private.list_exam_users() to authenticated;

create function public.list_exam_users()
returns table (email text, role text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from exam_access_private.list_exam_users();
$$;

create function public.set_exam_user_access(target_email text, target_role text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(target_email));
  session_email text := lower(btrim(coalesce(auth.jwt() ->> 'email', '')));
begin
  if not public.is_exam_admin() then
    raise exception 'Only exam admins can change access' using errcode = '42501';
  end if;
  if normalized_email is null or normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or target_role is null or target_role not in ('base', 'privileged', 'admin') then
    raise exception 'Invalid email or access role' using errcode = '22023';
  end if;
  if normalized_email = session_email and target_role <> 'admin' then
    raise exception 'Admin cannot change their own access' using errcode = '42501';
  end if;

  if target_role = 'base' then
    delete from public.exam_access where email = normalized_email;
  else
    insert into public.exam_access (email, role) values (normalized_email, target_role)
    on conflict (email) do update set role = excluded.role;
  end if;
end;
$$;

revoke all on function public.list_exam_users(), public.set_exam_user_access(text, text) from public, anon;
grant execute on function public.list_exam_users(), public.set_exam_user_access(text, text) to authenticated;

drop policy if exists "Admins can upload past papers" on storage.objects;
drop policy if exists "Admins can replace past papers" on storage.objects;

commit;
