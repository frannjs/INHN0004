-- Run after the migration as the database owner in the Supabase SQL editor.
-- All fixtures, including the two test identities, are rolled back.
begin;

insert into auth.users (id) values
  ('ac4266ac-3df7-4c96-9ff2-d049f4921620'),
  ('bb03784f-0ebc-490d-bcd1-46ee62910bed');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"ac4266ac-3df7-4c96-9ff2-d049f4921620","role":"authenticated"}', true);

do $$
begin
  insert into public.reader_notes (id, user_id, page_key, anchor, body)
  values ('cae42d85-e334-4c78-8802-d5b9c880ec1b', auth.uid(), 'ch04',
    '{"quote":"relation","prefix":"a ","suffix":" is","start":2,"end":10}', 'Owner A test note');
  if (select count(*) from public.reader_notes) <> 1 then
    raise exception 'Owner A could not read its note';
  end if;
  update public.reader_notes set body = 'Owner A edited' where id = 'cae42d85-e334-4c78-8802-d5b9c880ec1b';
  if not exists (select 1 from public.reader_notes where body = 'Owner A edited') then
    raise exception 'Owner A could not edit its note';
  end if;
  begin
    update public.reader_notes set user_id = 'bb03784f-0ebc-490d-bcd1-46ee62910bed';
    raise exception 'Ownership transfer was incorrectly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.reader_notes (user_id, page_key, anchor, body) values (auth.uid(), 'ch04', '{}', 'Invalid anchor');
    raise exception 'A missing anchor was incorrectly accepted';
  exception when check_violation then null;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bb03784f-0ebc-490d-bcd1-46ee62910bed","role":"authenticated"}', true);

do $$
declare changed integer;
begin
  if exists (select 1 from public.reader_notes) then
    raise exception 'Owner B could read Owner A notes';
  end if;
  update public.reader_notes set body = 'Unauthorized edit' where id = 'cae42d85-e334-4c78-8802-d5b9c880ec1b';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Owner B could edit Owner A notes'; end if;
  delete from public.reader_notes where id = 'cae42d85-e334-4c78-8802-d5b9c880ec1b';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Owner B could delete Owner A notes'; end if;
  begin
    insert into public.reader_notes (user_id, page_key, anchor, body)
    values ('ac4266ac-3df7-4c96-9ff2-d049f4921620', 'ch04',
      '{"quote":"relation","prefix":"","suffix":"","start":0,"end":8}', 'Forged owner');
    raise exception 'Owner B could create a note for Owner A';
  exception when insufficient_privilege then null;
  end;
  insert into public.reader_notes (user_id, page_key, anchor, body)
  values (auth.uid(), 'ch07', '{"quote":"cardinality","prefix":"","suffix":"","start":0,"end":11}', 'Owner B own note');
  if (select count(*) from public.reader_notes) <> 1 then raise exception 'Owner B could not read its own note'; end if;
  delete from public.reader_notes where user_id = auth.uid();
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'Owner B could not delete its own note'; end if;
end;
$$;

reset role;
set local role anon;
do $$
begin
  begin
    perform 1 from public.reader_notes;
    raise exception 'Anonymous access was incorrectly allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
select 'PASS: owner CRUD, cross-user isolation, ownership protection, anchor validation, anonymous denial; fixtures rolled back' as result;
