-- ──────────────────────────────────────────────────────────────────────────────
-- Supabase setup for the christophershenefelt.com archive admin.
--
-- Run ONCE in the Supabase SQL editor for a fresh project. Idempotent — safe
-- to re-run; every CREATE uses IF NOT EXISTS or equivalent.
--
-- What this sets up:
--   1. Three Storage buckets (art-images, photo-images, pdf-files), public
--      read so the rendered site can use direct CDN URLs.
--   2. RLS policies on storage.objects scoping WRITE to a single authed
--      admin (identified by an env-driven email allowlist).
--
-- No application tables: content lives as markdown files in git. Supabase
-- handles auth + media storage only.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Storage buckets ────────────────────────────────────────────────────
--
-- Public read so the rendered site can serve image / PDF URLs directly
-- from the Supabase CDN. Writes happen via the admin (server-side, with
-- a session cookie from the admin's login), gated by the RLS policy
-- below.

insert into storage.buckets (id, name, public)
  values ('art-images', 'art-images', true)
  on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
  values ('photo-images', 'photo-images', true)
  on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
  values ('pdf-files', 'pdf-files', true)
  on conflict (id) do update set public = true;

-- ── 2. RLS: admin-only writes ──────────────────────────────────────────────
--
-- The owner identity is encoded in the `admin_emails` settings table
-- below. Anyone in that list can upload / delete to the three buckets;
-- everyone else is read-only.
--
-- We use a tiny key/value table for the allowlist so the value can be
-- updated from the Supabase Dashboard without a code change. Seed it
-- with your address below (uncomment + replace).

create table if not exists admin_emails (
  email text primary key
);
-- Seed your address (uncomment + edit before running):
-- insert into admin_emails (email) values ('you@example.com') on conflict do nothing;

-- RLS on the allowlist — no permissive policies, so the anon / authenticated
-- roles can't read it directly. The `is_admin()` function below uses
-- SECURITY DEFINER to bypass RLS and check membership; that's the only
-- path through. Defense in depth: even if someone got hold of the anon
-- key, they couldn't enumerate admins.
alter table admin_emails enable row level security;

-- Helper: is the current authed user in the allowlist?
create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public
  as $$
    select exists (
      select 1 from admin_emails
      where lower(email) = lower((auth.jwt() ->> 'email'))
    )
  $$;

-- Public read for all three buckets.
drop policy if exists archive_buckets_public_read on storage.objects;
create policy archive_buckets_public_read on storage.objects
  for select
  using (bucket_id in ('art-images', 'photo-images', 'pdf-files'));

-- Admin write (INSERT / UPDATE / DELETE) on the three buckets.
drop policy if exists archive_buckets_admin_insert on storage.objects;
create policy archive_buckets_admin_insert on storage.objects
  for insert
  with check (
    bucket_id in ('art-images', 'photo-images', 'pdf-files')
    and is_admin()
  );

drop policy if exists archive_buckets_admin_update on storage.objects;
create policy archive_buckets_admin_update on storage.objects
  for update
  using (
    bucket_id in ('art-images', 'photo-images', 'pdf-files')
    and is_admin()
  );

drop policy if exists archive_buckets_admin_delete on storage.objects;
create policy archive_buckets_admin_delete on storage.objects
  for delete
  using (
    bucket_id in ('art-images', 'photo-images', 'pdf-files')
    and is_admin()
  );
