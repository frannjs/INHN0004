begin;

insert into auth.users (id) values
  ('10af56ab-96c9-47e0-8e8d-fadee44911b2'),
  ('20c97489-32d2-4f36-baca-64705f7bdf3f');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10af56ab-96c9-47e0-8e8d-fadee44911b2"}', true);

insert into public.reader_positions values (auth.uid(), 'ch07', 'sec-7-2', 1200);
insert into public.reader_positions values (auth.uid(), 'ch09', 'sec-9-2', 2400)
on conflict (user_id) do update set
  page_key = excluded.page_key,
  section_id = excluded.section_id,
  section_progress = excluded.section_progress;

do $$
begin
  if (select count(*) from public.reader_positions) <> 1 or not exists (
    select 1 from public.reader_positions where page_key = 'ch09' and section_progress = 2400
  ) then
    raise exception 'Owner could not restore the updated reading position';
  end if;
  begin
    update public.reader_positions set section_progress = -1;
    raise exception 'Invalid position accepted';
  exception when check_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"20c97489-32d2-4f36-baca-64705f7bdf3f"}', true);

do $$
begin
  if exists (select 1 from public.reader_positions) then
    raise exception 'Another account could read the saved position';
  end if;
  update public.reader_positions set page_key = 'ch02';
  if found then raise exception 'Another account could overwrite the saved position'; end if;
  begin
    insert into public.reader_positions values ('10af56ab-96c9-47e0-8e8d-fadee44911b2', 'ch07', null, 0)
    on conflict (user_id) do update set page_key = excluded.page_key;
    raise exception 'An upsert under a forged owner was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role anon;
do $$
begin
  begin
    perform 1 from public.reader_positions;
    raise exception 'Anonymous access was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
select 'PASS: owner upsert, cross-account isolation, validation, and anonymous denial' as result;
