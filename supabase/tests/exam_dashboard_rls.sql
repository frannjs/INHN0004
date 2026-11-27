-- Run against the migrated database as its owner. Fixtures are rolled back.
begin;

insert into auth.users (id, email) values
  ('b79bf445-4a80-4b89-8591-e1e572bad917', 'dashboard-admin@example.com'),
  ('7f94b3bf-6b87-4ead-bfbb-48f3e7537bbf', 'dashboard-base@example.com');
insert into public.exam_access (email, role, note) values
  ('dashboard-admin@example.com', 'admin', null),
  ('dashboard-pending@example.com', 'privileged', 'Existing note');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b79bf445-4a80-4b89-8591-e1e572bad917","email":"dashboard-admin@example.com","role":"authenticated"}', true);

do $$
begin
  if not exists (select 1 from public.list_exam_users() where email = 'dashboard-base@example.com' and role = 'base')
     or not exists (select 1 from public.list_exam_users() where email = 'dashboard-admin@example.com' and role = 'admin')
     or exists (select 1 from public.list_exam_users() where email = 'dashboard-pending@example.com') then
    raise exception 'Dashboard list must contain only registered users, including Base';
  end if;

  perform public.set_exam_user_access('  Dashboard-Pending@Example.com ', 'admin');
  if not exists (select 1 from public.exam_access where email = 'dashboard-pending@example.com' and role = 'admin' and note = 'Existing note') then
    raise exception 'Updating a role must preserve its existing note';
  end if;
  perform public.set_exam_user_access('dashboard-pending@example.com', 'base');
  if exists (select 1 from public.exam_access where email = 'dashboard-pending@example.com') then
    raise exception 'Setting Base must revoke elevated access';
  end if;
  perform public.set_exam_user_access('dashboard-base@example.com', 'privileged');
  if not exists (select 1 from public.list_exam_users() where email = 'dashboard-base@example.com' and role = 'privileged') then
    raise exception 'New grants must appear in the user list';
  end if;
  perform public.set_exam_user_access('dashboard-base@example.com', 'base');
  if not exists (select 1 from public.list_exam_users() where email = 'dashboard-base@example.com' and role = 'base') then
    raise exception 'Revoking access must leave the registered account at Base';
  end if;
  perform public.set_exam_user_access('dashboard-base@example.com', 'privileged');
  begin
    perform public.set_exam_user_access('dashboard-admin@example.com', 'base');
    raise exception 'An admin could revoke their own access';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"7f94b3bf-6b87-4ead-bfbb-48f3e7537bbf","email":"dashboard-base@example.com","role":"authenticated"}', true);

do $$
begin
  begin
    perform * from public.list_exam_users();
    raise exception 'A privileged user could list other users';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.set_exam_user_access('dashboard-base@example.com', 'admin');
    raise exception 'A privileged user could promote themselves';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role anon;
do $$
begin
  begin
    perform * from public.list_exam_users();
    raise exception 'An anonymous user could list other users';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
select 'PASS: exam dashboard list and role changes are admin-only' as result;
