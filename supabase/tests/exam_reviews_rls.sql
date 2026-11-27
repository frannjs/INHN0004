begin;

insert into auth.users (id) values
  ('5bd95d5b-3ccf-4415-96e9-a027245f0991'),
  ('66e7694c-4596-4ed2-8b66-d97fe6f931b1');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"5bd95d5b-3ccf-4415-96e9-a027245f0991"}', true);
insert into public.exam_reviews values (auth.uid(), 'ws2021-22-mock');
insert into public.exam_reviews values (auth.uid(), 'ws2021-22-mock') on conflict do nothing;

do $$
begin
  if (select count(*) from public.exam_reviews where exam_id = 'ws2021-22-mock') <> 1 then
    raise exception 'The owner could not read their review';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"66e7694c-4596-4ed2-8b66-d97fe6f931b1"}', true);
do $$
begin
  if exists (select 1 from public.exam_reviews) then
    raise exception 'Another account could read the review';
  end if;
  delete from public.exam_reviews where exam_id = 'ws2021-22-mock';
  if found then raise exception 'Another account could clear the review'; end if;
  begin
    insert into public.exam_reviews values ('5bd95d5b-3ccf-4415-96e9-a027245f0991', 'ws2021-22-endterm');
    raise exception 'A forged reviewer was allowed';
  exception when insufficient_privilege then null;
  end;
  insert into public.exam_reviews values (auth.uid(), 'ws2021-22-mock');
end;
$$;

select set_config('request.jwt.claims', '{"sub":"5bd95d5b-3ccf-4415-96e9-a027245f0991"}', true);
do $$
begin
  delete from public.exam_reviews where exam_id = 'ws2021-22-mock';
  if not found then raise exception 'The owner could not clear their review'; end if;
end;
$$;

reset role;
set local role anon;
do $$
begin
  begin
    perform 1 from public.exam_reviews;
    raise exception 'Anonymous access was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
select 'PASS: mark, read, and clear reviews with account isolation' as result;
