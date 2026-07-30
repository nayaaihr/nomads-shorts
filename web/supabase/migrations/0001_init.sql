-- Nomads Shorts — initial schema.
-- Run this in the Supabase SQL editor, or via `supabase db push` if you use
-- the Supabase CLI locally.

-- ============================================================================
-- profiles: 1:1 with auth.users, holds credit balance + display info.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  credits int not null default 0,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- videos: one row per long-form source video a user submits.
-- ============================================================================
create type public.video_status as enum (
  'queued',       -- job created, waiting for a worker
  'downloading',  -- pulling from YouTube
  'transcribing',
  'picking',      -- LLM choosing best moments
  'clipping',     -- ffmpeg reframe + captions per clip
  'ready',        -- all clips exported
  'failed'
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_url text not null,
  source_kind text not null check (source_kind in ('youtube_oauth', 'youtube_public')),
  youtube_video_id text,
  title text,
  duration_seconds int,
  language text,
  status public.video_status not null default 'queued',
  status_message text,
  credits_charged int not null default 0,
  storage_key text,        -- R2 key of the downloaded source
  transcript jsonb,        -- Whisper output (segments + words)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_user_id_created_at_idx
  on public.videos (user_id, created_at desc);
create index if not exists videos_status_idx
  on public.videos (status);

-- ============================================================================
-- clips: N:1 with videos, one row per exported short.
-- ============================================================================
create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ordinal int not null,             -- display order within the video
  title text,
  hook text,                        -- one-line reason the LLM picked it
  start_seconds numeric not null,
  end_seconds numeric not null,
  duration_seconds numeric generated always as (end_seconds - start_seconds) stored,
  storage_key text,                 -- R2 key of the exported vertical mp4
  thumbnail_key text,
  virality_score int,               -- 0-100 heuristic from the LLM
  created_at timestamptz not null default now()
);

create index if not exists clips_video_id_ordinal_idx
  on public.clips (video_id, ordinal);
create index if not exists clips_user_id_created_at_idx
  on public.clips (user_id, created_at desc);

-- ============================================================================
-- credit_ledger: append-only history of credit grants and spends.
-- Balance in profiles.credits is the sum of amount for the user.
-- ============================================================================
create type public.credit_reason as enum (
  'signup_bonus',
  'purchase',
  'refund',
  'video_processed',
  'admin_adjustment'
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,               -- positive = grant, negative = spend
  reason public.credit_reason not null,
  video_id uuid references public.videos(id) on delete set null,
  stripe_event_id text unique,       -- prevents double-crediting on webhook retries
  note text,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_id_created_at_idx
  on public.credit_ledger (user_id, created_at desc);

-- ============================================================================
-- Trigger: create a profile row + signup bonus when a new auth.users row lands.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    15  -- FREE_TRIAL_CREDITS (keep in sync with src/lib/pricing.ts)
  );

  insert into public.credit_ledger (user_id, amount, reason, note)
  values (new.id, 15, 'signup_bonus', 'Welcome to Nomads Shorts');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row-level security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.clips enable row level security;
alter table public.credit_ledger enable row level security;

-- Profiles: user can read + update their own row.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Videos: user can CRUD their own.
create policy "videos_select_own"
  on public.videos for select
  using (auth.uid() = user_id);

create policy "videos_insert_own"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "videos_update_own"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "videos_delete_own"
  on public.videos for delete
  using (auth.uid() = user_id);

-- Clips: user can read + delete their own; writes come from the worker
-- (service role, which bypasses RLS).
create policy "clips_select_own"
  on public.clips for select
  using (auth.uid() = user_id);

create policy "clips_delete_own"
  on public.clips for delete
  using (auth.uid() = user_id);

-- Ledger: user can only read their own history. All writes go through the
-- service role (worker + Stripe webhook).
create policy "ledger_select_own"
  on public.credit_ledger for select
  using (auth.uid() = user_id);
