-- PROPOSAL, not applied. Old wallpaper detail URLs → their replacement (308)
-- or Gone (410), for the Worker's detail-URL redirects (worker/index.ts via
-- /api/catalog/paths). Renamed and recategorised wallpapers already redirect
-- by id; this table is for URLs whose id no longer exists.
--
-- Rule: renamed → the new detail page, removed → its primary collection or
-- category, legal takedown → 410. A row whose path still resolves to a live
-- wallpaper is ignored, so the live page always wins.
--
-- After applying, set WALLPAPER_REDIRECTS_TABLE=1 on the Worker. Rows take
-- effect within about 20 minutes (the map route and the Worker each cache for
-- 10). The in-repo rules in lib/public-catalog/redirects.ts keep working
-- either way; a row for the same path overrides them.

create table public.wallpaper_redirects (
  -- `/wallpaper/{category}/{slug}`, stored lowercase without a trailing slash.
  old_path text primary key
    check (old_path ~ '^/wallpaper/[^/]+/[^/.]+$' and old_path = lower(old_path)),
  -- Site path (starts with a single `/`); null for a 410.
  target_path text null
    check (target_path is null or (target_path ~ '^/[^/\\]' and target_path <> old_path)),
  status smallint not null check (status in (308, 410)),
  reason text,
  created_at timestamptz not null default now(),
  constraint wallpaper_redirects_target_matches_status check (
    (status = 308 and target_path is not null)
    or (status = 410 and target_path is null)
  )
);

comment on table public.wallpaper_redirects is
  'Old wallpaper detail URLs: 308 to target_path, or 410. Read by /api/catalog/paths with the anon key.';

alter table public.wallpaper_redirects enable row level security;
revoke all on public.wallpaper_redirects from public, anon, authenticated;
grant select on public.wallpaper_redirects to anon, authenticated;

-- The same public paths as the sitemap; writes stay with service_role.
create policy wallpaper_redirects_public_read
  on public.wallpaper_redirects
  for select
  to anon, authenticated
  using (true);
