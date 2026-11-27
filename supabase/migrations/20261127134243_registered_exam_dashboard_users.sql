create or replace function exam_access_private.list_exam_users()
returns table (email text, role text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or exam_access_private.current_exam_role() is distinct from 'admin' then
    raise exception 'Only exam admins can list users' using errcode = '42501';
  end if;

  return query
    select accounts.email, coalesce(access.role, 'base')
    from (
      select distinct lower(btrim(account.email)) as email
      from auth.users as account
      where nullif(btrim(account.email), '') is not null
    ) as accounts
    left join public.exam_access as access on access.email = accounts.email;
end;
$$;
