-- Lowe-s schema: profiles + listings + image storage (M2).
-- Safe to run more than once. Apply in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, so we can show seller names without
-- exposing auth.users to the client.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile when a user signs up. Derives a first-name display name
-- from the Covenant email (first.last@covenant.edu -> "First").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    initcap(split_part(split_part(new.email, '@', 1), '.', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for anyone who signed up before this trigger existed.
insert into public.profiles (id, email, display_name)
select id, email, initcap(split_part(split_part(email, '@', 1), '.', 1))
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid references public.profiles (id) on delete set null,
  title       text not null check (char_length(title) between 1 and 120),
  description text,
  price_cents integer not null check (price_cents >= 0),
  category    text,
  image_url   text,
  status      text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists listings_status_created_idx
  on public.listings (status, created_at desc);

alter table public.listings enable row level security;

-- Read: any signed-in user sees active listings; sellers also see their own
-- (in any status).
drop policy if exists "listings readable by authenticated" on public.listings;
create policy "listings readable by authenticated"
  on public.listings for select to authenticated
  using (status = 'active' or seller_id = auth.uid());

-- Write: owner only.
drop policy if exists "users insert own listings" on public.listings;
create policy "users insert own listings"
  on public.listings for insert to authenticated
  with check (seller_id = auth.uid());

drop policy if exists "users update own listings" on public.listings;
create policy "users update own listings"
  on public.listings for update to authenticated
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());

drop policy if exists "users delete own listings" on public.listings;
create policy "users delete own listings"
  on public.listings for delete to authenticated
  using (seller_id = auth.uid());

-- Keep updated_at fresh on edits.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_touch_updated_at on public.listings;
create trigger listings_touch_updated_at
  before update on public.listings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- storage: bucket for listing images (public read; used by M3 image upload).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "listing images publicly readable" on storage.objects;
create policy "listing images publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Uploads go into a per-user folder: <uid>/<filename>.
drop policy if exists "users upload own listing images" on storage.objects;
create policy "users upload own listing images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own listing images" on storage.objects;
create policy "users delete own listing images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
