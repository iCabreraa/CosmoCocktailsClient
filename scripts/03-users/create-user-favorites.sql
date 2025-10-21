-- Create user_favorites table and RLS policies

create table if not exists public.user_favorites (
  user_id uuid not null references public.users_new(id) on delete cascade,
  cocktail_id uuid not null references public.cocktails(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, cocktail_id)
);

alter table public.user_favorites enable row level security;

do $$ begin
  create policy user_favorites_select_own
  on public.user_favorites for select
  using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy user_favorites_modify_own
  on public.user_favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy user_favorites_delete_own
  on public.user_favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


