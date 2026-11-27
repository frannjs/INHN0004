begin;

create table public.exam_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null check (exam_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  primary key (user_id, exam_id)
);

alter table public.exam_reviews enable row level security;
alter table public.exam_reviews force row level security;

revoke all on public.exam_reviews from public, anon, authenticated;
grant select, insert, delete on public.exam_reviews to authenticated;

create policy "Read own exam reviews" on public.exam_reviews for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Mark own exam reviews" on public.exam_reviews for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Clear own exam reviews" on public.exam_reviews for delete to authenticated
using ((select auth.uid()) = user_id);

commit;
