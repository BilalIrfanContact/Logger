-- Private journal capture. Raw notes are mutable user source material; revisions
-- are append-only snapshots used as stable input for later organization jobs.
create table if not exists public.journal_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_date date not null,
  timezone text not null,
  midnight_at timestamptz not null,
  due_at timestamptz not null,
  current_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, journal_date),
  unique (id, user_id),
  check (due_at > midnight_at)
);

comment on column public.journal_days.timezone is
  'IANA timezone snapshot used by this journal day, independent of current account preferences.';
comment on column public.journal_days.midnight_at is
  'UTC instant representing the start of journal_date in timezone.';
comment on column public.journal_days.due_at is
  'UTC instant of the next local midnight when organization work becomes due.';
comment on column public.journal_days.current_revision_id is
  'Latest raw-note snapshot. Older revisions remain immutable but are stale for new jobs.';

create or replace function public.set_journal_day_schedule()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.midnight_at = new.journal_date::timestamp at time zone new.timezone;
  new.due_at = (new.journal_date + 1)::timestamp at time zone new.timezone;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_days_set_schedule on public.journal_days;
create trigger journal_days_set_schedule
before insert or update of journal_date, timezone on public.journal_days
for each row execute function public.set_journal_day_schedule();

create or replace function public.set_journal_record_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_days_set_updated_at on public.journal_days;
create trigger journal_days_set_updated_at
before update on public.journal_days
for each row execute function public.set_journal_record_updated_at();

create table if not exists public.raw_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_day_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (journal_day_id, user_id)
    references public.journal_days (id, user_id) on delete cascade,
  check (char_length(btrim(content)) > 0),
  check (char_length(content) <= 20000)
);

create index if not exists raw_notes_day_created_at_idx
  on public.raw_notes (journal_day_id, created_at desc);

drop trigger if exists raw_notes_set_updated_at on public.raw_notes;
create trigger raw_notes_set_updated_at
before update on public.raw_notes
for each row execute function public.set_journal_record_updated_at();

create table if not exists public.journal_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_day_id uuid not null,
  revision_number bigint not null check (revision_number > 0),
  created_at timestamptz not null default now(),
  unique (journal_day_id, revision_number),
  unique (id, user_id),
  foreign key (journal_day_id, user_id)
    references public.journal_days (id, user_id) on delete cascade
);

create table if not exists public.journal_revision_notes (
  revision_id uuid not null,
  raw_note_id uuid not null,
  content text not null,
  note_created_at timestamptz not null,
  note_updated_at timestamptz not null,
  primary key (revision_id, raw_note_id),
  foreign key (revision_id) references public.journal_revisions (id) on delete cascade
);

create index if not exists journal_revisions_day_created_at_idx
  on public.journal_revisions (journal_day_id, created_at desc);

alter table public.journal_days
  drop constraint if exists journal_days_current_revision_fk;
alter table public.journal_days
  add constraint journal_days_current_revision_fk
  foreign key (current_revision_id) references public.journal_revisions (id)
  on delete set null;

alter table public.organization_jobs
  drop constraint if exists organization_jobs_journal_day_fk;
alter table public.organization_jobs
  add constraint organization_jobs_journal_day_fk
  foreign key (journal_day_id, user_id)
  references public.journal_days (id, user_id) on delete cascade;

alter table public.organization_jobs
  drop constraint if exists organization_jobs_revision_fk;
alter table public.organization_jobs
  add constraint organization_jobs_revision_fk
  foreign key (revision_id, user_id)
  references public.journal_revisions (id, user_id) on delete cascade;

create or replace function public.create_journal_revision(p_journal_day_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := auth.uid();
  revision_id uuid;
  next_revision_number bigint;
begin
  if authenticated_user_id is null then
    raise exception 'authentication required';
  end if;

  select coalesce(max(revision_number), 0) + 1
    into next_revision_number
    from public.journal_revisions
   where journal_day_id = p_journal_day_id
     and user_id = authenticated_user_id;

  insert into public.journal_revisions (user_id, journal_day_id, revision_number)
  values (authenticated_user_id, p_journal_day_id, next_revision_number)
  returning id into revision_id;

  insert into public.journal_revision_notes (
    revision_id,
    raw_note_id,
    content,
    note_created_at,
    note_updated_at
  )
  select revision_id, id, content, created_at, updated_at
    from public.raw_notes
   where journal_day_id = p_journal_day_id
     and user_id = authenticated_user_id
   order by created_at, id;

  update public.journal_days
     set current_revision_id = revision_id
   where id = p_journal_day_id
     and user_id = authenticated_user_id;

  return revision_id;
end;
$$;

create or replace function public.get_or_create_journal_day(
  p_journal_date date,
  p_timezone text
)
returns public.journal_days
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := auth.uid();
  journal_day public.journal_days;
begin
  if authenticated_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_journal_date > (now() at time zone p_timezone)::date then
    raise exception 'future journal dates are not available';
  end if;

  insert into public.journal_days (user_id, journal_date, timezone)
  values (authenticated_user_id, p_journal_date, p_timezone)
  on conflict (user_id, journal_date) do nothing;

  select * into journal_day
    from public.journal_days
   where user_id = authenticated_user_id
     and journal_date = p_journal_date;

  return journal_day;
end;
$$;

create or replace function public.save_raw_note(
  p_journal_date date,
  p_timezone text,
  p_note_id uuid,
  p_content text
)
returns public.raw_notes
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := auth.uid();
  day_record public.journal_days;
  raw_note public.raw_notes;
begin
  if authenticated_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into day_record
    from public.get_or_create_journal_day(p_journal_date, p_timezone);

  select * into day_record
    from public.journal_days
   where id = day_record.id
     and user_id = authenticated_user_id
   for update;

  if p_note_id is null then
    insert into public.raw_notes (user_id, journal_day_id, content)
    values (authenticated_user_id, day_record.id, p_content)
    returning * into raw_note;
  else
    update public.raw_notes
       set content = p_content
     where id = p_note_id
       and user_id = authenticated_user_id
       and journal_day_id = day_record.id
    returning * into raw_note;

    if raw_note.id is null then
      raise exception 'raw note not found';
    end if;
  end if;

  perform public.create_journal_revision(day_record.id);
  return raw_note;
end;
$$;

create or replace function public.delete_raw_note(p_note_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := auth.uid();
  raw_note_day_id uuid;
begin
  if authenticated_user_id is null then
    raise exception 'authentication required';
  end if;

  select raw_notes.journal_day_id into raw_note_day_id
    from public.raw_notes
   where raw_notes.id = p_note_id
     and raw_notes.user_id = authenticated_user_id;

  if raw_note_day_id is null then
    raise exception 'raw note not found';
  end if;

  perform 1
   from public.journal_days
   where id = raw_note_day_id
     and user_id = authenticated_user_id
   for update;

  delete from public.raw_notes
   where id = p_note_id
     and user_id = authenticated_user_id;
  perform public.create_journal_revision(raw_note_day_id);
  return true;
end;
$$;

-- The revision snapshots are private implementation data. Authenticated
-- callers can only read their own rows; mutation happens through the RPCs.
alter table public.journal_days enable row level security;
alter table public.raw_notes enable row level security;
alter table public.journal_revisions enable row level security;
alter table public.journal_revision_notes enable row level security;

drop policy if exists "Users can view their journal days" on public.journal_days;
create policy "Users can view their journal days"
  on public.journal_days for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view their raw notes" on public.raw_notes;
create policy "Users can view their raw notes"
  on public.raw_notes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view their journal revisions" on public.journal_revisions;
create policy "Users can view their journal revisions"
  on public.journal_revisions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view their revision notes" on public.journal_revision_notes;
create policy "Users can view their revision notes"
  on public.journal_revision_notes for select
  using (
    exists (
      select 1 from public.journal_revisions revision
       where revision.id = revision_id
         and revision.user_id = auth.uid()
    )
  );

revoke all on function public.create_journal_revision(uuid) from public;
revoke all on function public.get_or_create_journal_day(date, text) from public;
revoke all on function public.save_raw_note(date, text, uuid, text) from public;
revoke all on function public.delete_raw_note(uuid) from public;
grant execute on function public.get_or_create_journal_day(date, text) to authenticated;
grant execute on function public.save_raw_note(date, text, uuid, text) to authenticated;
grant execute on function public.delete_raw_note(uuid) to authenticated;
