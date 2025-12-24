-- Shop performance indexes
-- Run in Supabase SQL editor or psql session.

create index if not exists idx_cocktails_is_available_name
  on public.cocktails (is_available, name);

create index if not exists idx_cocktail_sizes_cocktail_available
  on public.cocktail_sizes (cocktail_id, available);

create index if not exists idx_cocktail_sizes_sizes_id
  on public.cocktail_sizes (sizes_id);

-- Favorites queries (user favorites ordered by time)
create index if not exists idx_user_favorites_user_created_at
  on public.user_favorites (user_id, created_at desc);

-- Optional: speed up ilike searches on name (requires pg_trgm extension)
create extension if not exists pg_trgm;
create index if not exists idx_cocktails_name_trgm
  on public.cocktails using gin (name gin_trgm_ops);
