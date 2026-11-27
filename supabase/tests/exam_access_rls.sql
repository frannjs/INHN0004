-- Run after 20261127125604_exam_admin_roles.sql as the database owner in the Supabase SQL editor.
-- All test fixtures are rolled back at the end of the transaction.
begin;

insert into public.exam_access (email, role, note) values
  ('  Test.Admin@Example.com  ', 'admin', 'Admin fixture'),
  ('privileged.reader@tum.de', 'privileged', 'Privileged fixture')
on conflict (email) do update set role = excluded.role, note = excluded.note;

do $$
begin
  if not exists (
    select 1 from public.exam_access where email = 'test.admin@example.com' and role = 'admin'
  ) then
    raise exception 'Email normalization trigger did not lowercase and trim admin email';
  end if;
end;
$$;

-- 1. Admin can view all rows, grant privileged/admin, update others, and revoke others,
--    but cannot demote or delete themselves.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"Test.Admin@Example.com","role":"authenticated"}',
  true
);

do $$
declare removed integer;
begin
  if public.current_exam_role() is distinct from 'admin' or not public.is_exam_admin() or not public.has_exam_access() then
    raise exception 'Admin role checks failed';
  end if;
  if (select count(*) from public.exam_access) < 2 then
    raise exception 'Admin could not list all exam_access rows';
  end if;

  insert into public.exam_access (email, role, note)
  values ('new.friend@tum.de', 'privileged', 'Added from /dashboard');

  update public.exam_access set role = 'admin' where email = 'new.friend@tum.de';
  if not exists (select 1 from public.exam_access where email = 'new.friend@tum.de' and role = 'admin') then
    raise exception 'Admin could not promote another user to admin';
  end if;

  delete from public.exam_access where email = 'new.friend@tum.de';
  get diagnostics removed = row_count;
  if removed <> 1 then
    raise exception 'Admin could not revoke another user';
  end if;

  -- Self-demotion and self-deletion must fail.
  begin
    update public.exam_access set role = 'privileged' where email = 'test.admin@example.com';
    raise exception 'Admin was allowed to self-demote';
  exception when insufficient_privilege then null;
  end;

  delete from public.exam_access where email = 'test.admin@example.com';
  get diagnostics removed = row_count;
  if removed <> 0 then
    raise exception 'Admin was allowed to delete their own admin entry';
  end if;
end;
$$;

-- 2. Privileged user has exam access, sees ONLY their own row, and cannot grant/modify/delete anyone.
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"privileged.reader@tum.de","role":"authenticated"}',
  true
);

do $$
declare changed integer;
begin
  if public.current_exam_role() is distinct from 'privileged' or not public.has_exam_access() then
    raise exception 'Privileged user should have exam access';
  end if;
  if public.is_exam_admin() then
    raise exception 'Privileged user must not be admin';
  end if;
  if (select count(*) from public.exam_access) <> 1 then
    raise exception 'Privileged user could enumerate other allowlisted accounts';
  end if;

  begin
    insert into public.exam_access (email, role) values ('friend2@tum.de', 'privileged');
    raise exception 'Privileged user was allowed to grant exam access';
  exception when insufficient_privilege then null;
  end;

  update public.exam_access set role = 'admin' where email = 'privileged.reader@tum.de';
  get diagnostics changed = row_count;
  if changed <> 0 then
    raise exception 'Privileged user was allowed to self-promote to admin';
  end if;
end;
$$;

-- 3. Base user sees 0 rows, has neither exam nor admin access, and cannot grant access.
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","email":"base.student@tum.de","role":"authenticated"}',
  true
);

do $$
begin
  if exists (select 1 from public.exam_access) then
    raise exception 'Base user could read exam_access';
  end if;
  if public.current_exam_role() is not null or public.has_exam_access() or public.is_exam_admin() then
    raise exception 'Base user gained elevated privileges';
  end if;
  begin
    insert into public.exam_access (email, role) values ('base.student@tum.de', 'privileged');
    raise exception 'Base user could self-grant access';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- 4. Anonymous role is completely blocked.
reset role;
set local role anon;
do $$
begin
  begin
    perform 1 from public.exam_access;
    raise exception 'Anonymous access to exam_access was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.current_exam_role();
    raise exception 'Anonymous execution of the role lookup was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
select 'PASS: 3-tier admin / privileged / base access control verified' as result;
