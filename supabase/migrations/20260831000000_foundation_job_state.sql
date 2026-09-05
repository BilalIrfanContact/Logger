-- Foundation storage for durable organization work. Journal-day and revision
-- tables are introduced by later migrations and are linked when that work lands.
create extension if not exists pgcrypto;

create table if not exists public.organization_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_day_id uuid not null,
  revision_id uuid not null,
  trigger text not null check (trigger in ('note_added', 'midnight', 'manual_retry')),
  model_id text,
  provider_response_id text,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'review_ready', 'saved', 'failed')
  ),
  retry_count smallint not null default 0 check (retry_count >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.organization_jobs is
  'Durable AI organization state. User-facing journal data is stored separately.';
comment on column public.organization_jobs.journal_day_id is
  'UUID of the owning journal day. The foreign key is added with the journal-day migration.';
comment on column public.organization_jobs.revision_id is
  'UUID of the raw-note revision this job organizes.';

create index if not exists organization_jobs_user_created_at_idx
  on public.organization_jobs (user_id, created_at desc);

create unique index if not exists organization_jobs_one_active_revision_idx
  on public.organization_jobs (user_id, revision_id)
  where status in ('pending', 'processing');

alter table public.organization_jobs enable row level security;

create policy "Users can view their organization jobs"
  on public.organization_jobs
  for select
  using (auth.uid() = user_id);

create policy "Users can create their organization jobs"
  on public.organization_jobs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their organization jobs"
  on public.organization_jobs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their organization jobs"
  on public.organization_jobs
  for delete
  using (auth.uid() = user_id);
