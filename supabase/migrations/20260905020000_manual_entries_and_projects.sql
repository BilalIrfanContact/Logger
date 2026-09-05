-- User-controlled saved journal entries and reusable projects.
-- Mutations go through authenticated RPCs so ownership is checked both at the
-- application boundary and inside the database transaction.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  name_normalized text generated always as (
    lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))
  ) stored,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (char_length(name) between 1 and 120),
  check (name = regexp_replace(btrim(name), '\s+', ' ', 'g'))
);

comment on table public.projects is
  'Private user-owned project names used to group saved journal entries.';
comment on column public.projects.name is
  'Canonical display name with outer and repeated whitespace normalized.';
comment on column public.projects.name_normalized is
  'Case-insensitive, whitespace-normalized key used for active-name uniqueness.';

create unique index if not exists projects_active_name_idx
  on public.projects (user_id, name_normalized)
  where status = 'active';

create index if not exists projects_user_status_name_idx
  on public.projects (user_id, status, name_normalized);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_journal_record_updated_at();

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_day_id uuid not null,
  project_id uuid,
  content text not null,
  origin text not null default 'manual' check (origin in ('ai', 'manual')),
  display_order bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (journal_day_id, user_id)
    references public.journal_days (id, user_id) on delete cascade,
  foreign key (project_id, user_id)
    references public.projects (id, user_id) on delete cascade,
  check (char_length(btrim(content)) > 0),
  check (char_length(content) <= 20000)
);

comment on table public.journal_entries is
  'Saved user journal activities. AI output is temporary until an explicit save.';
comment on column public.journal_entries.project_id is
  'Nullable project relationship. NULL is an Uncategorized entry.';
comment on column public.journal_entries.display_order is
  'Lower values display first. New entries receive the next position at the top.';

create index if not exists journal_entries_day_order_idx
  on public.journal_entries (journal_day_id, display_order, created_at desc, id);
create index if not exists journal_entries_project_day_idx
  on public.journal_entries (project_id, journal_day_id, display_order);

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
before update on public.journal_entries
for each row execute function public.set_journal_record_updated_at();

-- This join table is ready for the later AI-save path. Manual entries never
-- receive source-note links, and this ticket does not write to it.
create table if not exists public.journal_entry_raw_notes (
  entry_id uuid not null,
  raw_note_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (entry_id, raw_note_id),
  foreign key (entry_id, user_id)
    references public.journal_entries (id, user_id) on delete cascade,
  foreign key (raw_note_id, user_id)
    references public.raw_notes (id, user_id) on delete cascade
);

create index if not exists journal_entry_raw_notes_note_idx
  on public.journal_entry_raw_notes (raw_note_id, user_id);

create or replace function public.require_authenticated_user()
returns uuid
language plpgsql
stable
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  return auth.uid();
end;
$$;

create or replace function public.normalize_project_name(p_name text)
returns text
language sql
immutable
set search_path = public
as $$
  select regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
$$;

create or replace function public.create_project(p_name text)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  canonical_name text := public.normalize_project_name(p_name);
  project public.projects;
begin
  if char_length(canonical_name) < 1 or char_length(canonical_name) > 120 then
    raise exception 'project name must be between 1 and 120 characters';
  end if;

  insert into public.projects (user_id, name)
  values (authenticated_user_id, canonical_name)
  returning * into project;
  return project;
exception
  when unique_violation then
    raise exception 'active project name already exists';
end;
$$;

create or replace function public.rename_project(
  p_project_id uuid,
  p_name text
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  canonical_name text := public.normalize_project_name(p_name);
  project public.projects;
begin
  if char_length(canonical_name) < 1 or char_length(canonical_name) > 120 then
    raise exception 'project name must be between 1 and 120 characters';
  end if;

  select * into project
    from public.projects
   where id = p_project_id
     and user_id = authenticated_user_id
   for update;
  if project.id is null then
    raise exception 'project not found';
  end if;

  update public.projects
     set name = canonical_name
   where id = p_project_id
     and user_id = authenticated_user_id
  returning * into project;
  return project;
exception
  when unique_violation then
    raise exception 'active project name already exists';
end;
$$;

create or replace function public.archive_project(p_project_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
begin
  update public.projects
     set status = 'archived'
   where id = p_project_id
     and user_id = authenticated_user_id;
  if not found then
    raise exception 'project not found';
  end if;
  return true;
end;
$$;

create or replace function public.restore_project(p_project_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
begin
  update public.projects
     set status = 'active'
   where id = p_project_id
     and user_id = authenticated_user_id;
  if not found then
    raise exception 'project not found';
  end if;
  return true;
exception
  when unique_violation then
    raise exception 'active project name already exists';
end;
$$;

create or replace function public.merge_projects(
  p_source_project_id uuid,
  p_target_project_id uuid,
  p_confirmation text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  source_project public.projects;
  target_project public.projects;
begin
  if p_confirmation <> 'MERGE' then
    raise exception 'type MERGE to confirm this project merge';
  end if;
  if p_source_project_id = p_target_project_id then
    raise exception 'choose two different projects to merge';
  end if;

  select * into source_project
    from public.projects
   where id = p_source_project_id
     and user_id = authenticated_user_id
   for update;
  select * into target_project
    from public.projects
   where id = p_target_project_id
     and user_id = authenticated_user_id
   for update;
  if source_project.id is null or target_project.id is null then
    raise exception 'project not found';
  end if;

  update public.journal_entries
     set project_id = target_project.id,
         updated_at = now()
   where project_id = source_project.id
     and user_id = authenticated_user_id;

  delete from public.projects
   where id = source_project.id
     and user_id = authenticated_user_id;
  return true;
end;
$$;

create or replace function public.delete_project(
  p_project_id uuid,
  p_confirmation text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  project public.projects;
begin
  select * into project
    from public.projects
   where id = p_project_id
     and user_id = authenticated_user_id
   for update;
  if project.id is null then
    raise exception 'project not found';
  end if;
  if p_confirmation <> project.name then
    raise exception 'type the project name to confirm deletion';
  end if;

  delete from public.projects
   where id = project.id
     and user_id = authenticated_user_id;
  return true;
end;
$$;

create or replace function public.create_manual_journal_entry(
  p_journal_date date,
  p_timezone text,
  p_content text,
  p_project_id uuid default null
)
returns public.journal_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  day_record public.journal_days;
  entry public.journal_entries;
  next_order bigint;
begin
  if char_length(btrim(coalesce(p_content, ''))) < 1 or char_length(p_content) > 20000 then
    raise exception 'journal entries must contain between 1 and 20000 characters';
  end if;

  select * into day_record
    from public.get_or_create_journal_day(p_journal_date, p_timezone);
  select * into day_record
    from public.journal_days
   where id = day_record.id
     and user_id = authenticated_user_id
   for update;
  if p_project_id is not null and not exists (
    select 1 from public.projects
     where id = p_project_id
       and user_id = authenticated_user_id
       and status = 'active'
  ) then
    raise exception 'project not found or is archived';
  end if;

  select coalesce(min(display_order), 0) - 1 into next_order
    from public.journal_entries
   where journal_day_id = day_record.id
     and user_id = authenticated_user_id;

  insert into public.journal_entries (
    user_id, journal_day_id, project_id, content, origin, display_order
  )
  values (
    authenticated_user_id, day_record.id, p_project_id, btrim(p_content), 'manual', next_order
  )
  returning * into entry;
  return entry;
end;
$$;

create or replace function public.update_journal_entry(
  p_entry_id uuid,
  p_content text,
  p_project_id uuid default null
)
returns public.journal_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  current_entry public.journal_entries;
  entry public.journal_entries;
begin
  if char_length(btrim(coalesce(p_content, ''))) < 1 or char_length(p_content) > 20000 then
    raise exception 'journal entries must contain between 1 and 20000 characters';
  end if;

  select * into current_entry
    from public.journal_entries
   where id = p_entry_id
     and user_id = authenticated_user_id
   for update;
  if current_entry.id is null then
    raise exception 'journal entry not found';
  end if;

  if p_project_id is not null
     and p_project_id <> current_entry.project_id
     and not exists (
       select 1 from public.projects
        where id = p_project_id
          and user_id = authenticated_user_id
          and status = 'active'
     ) then
    raise exception 'project not found or is archived';
  end if;

  update public.journal_entries
     set content = btrim(p_content),
         project_id = p_project_id
   where id = current_entry.id
     and user_id = authenticated_user_id
  returning * into entry;
  return entry;
end;
$$;

create or replace function public.delete_journal_entry(
  p_entry_id uuid,
  p_confirmation text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
begin
  if p_confirmation <> 'DELETE' then
    raise exception 'type DELETE to confirm entry deletion';
  end if;
  delete from public.journal_entries
   where id = p_entry_id
     and user_id = authenticated_user_id;
  if not found then
    raise exception 'journal entry not found';
  end if;
  return true;
end;
$$;

create or replace function public.reorder_journal_entries(
  p_journal_day_id uuid,
  p_entry_ids uuid[]
)
returns setof public.journal_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  authenticated_user_id uuid := public.require_authenticated_user();
  expected_count integer;
  provided_count integer := coalesce(array_length(p_entry_ids, 1), 0);
begin
  if not exists (
    select 1 from public.journal_days
     where id = p_journal_day_id
       and user_id = authenticated_user_id
     for update
  ) then
    raise exception 'journal day not found';
  end if;

  select count(*) into expected_count
    from public.journal_entries
   where journal_day_id = p_journal_day_id
     and user_id = authenticated_user_id;

  if provided_count <> expected_count
     or provided_count <> (select count(distinct id) from unnest(coalesce(p_entry_ids, '{}')) as ids(id))
     or exists (
       select 1
         from unnest(coalesce(p_entry_ids, '{}')) as ids(id)
        where not exists (
          select 1 from public.journal_entries
           where journal_entries.id = ids.id
             and journal_entries.journal_day_id = p_journal_day_id
             and journal_entries.user_id = authenticated_user_id
        )
     ) then
    raise exception 'reorder must include each journal entry exactly once';
  end if;

  with ordered as (
    select id, ordinality - 1 as position
      from unnest(coalesce(p_entry_ids, '{}')) with ordinality as ids(id, ordinality)
  )
  update public.journal_entries entry
     set display_order = ordered.position,
         updated_at = now()
    from ordered
   where entry.id = ordered.id
     and entry.journal_day_id = p_journal_day_id
     and entry.user_id = authenticated_user_id;

  return query
    select * from public.journal_entries
     where journal_day_id = p_journal_day_id
       and user_id = authenticated_user_id
     order by display_order, created_at desc, id;
end;
$$;

alter table public.projects enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_entry_raw_notes enable row level security;

drop policy if exists "Users can view their projects" on public.projects;
create policy "Users can view their projects"
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view their journal entries" on public.journal_entries;
create policy "Users can view their journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view their entry sources" on public.journal_entry_raw_notes;
create policy "Users can view their entry sources"
  on public.journal_entry_raw_notes for select
  using (auth.uid() = user_id);

revoke all on function public.require_authenticated_user() from public;
revoke all on function public.normalize_project_name(text) from public;
revoke all on function public.create_project(text) from public;
revoke all on function public.rename_project(uuid, text) from public;
revoke all on function public.archive_project(uuid) from public;
revoke all on function public.restore_project(uuid) from public;
revoke all on function public.merge_projects(uuid, uuid, text) from public;
revoke all on function public.delete_project(uuid, text) from public;
revoke all on function public.create_manual_journal_entry(date, text, text, uuid) from public;
revoke all on function public.update_journal_entry(uuid, text, uuid) from public;
revoke all on function public.delete_journal_entry(uuid, text) from public;
revoke all on function public.reorder_journal_entries(uuid, uuid[]) from public;

grant execute on function public.create_project(text) to authenticated;
grant execute on function public.rename_project(uuid, text) to authenticated;
grant execute on function public.archive_project(uuid) to authenticated;
grant execute on function public.restore_project(uuid) to authenticated;
grant execute on function public.merge_projects(uuid, uuid, text) to authenticated;
grant execute on function public.delete_project(uuid, text) to authenticated;
grant execute on function public.create_manual_journal_entry(date, text, text, uuid) to authenticated;
grant execute on function public.update_journal_entry(uuid, text, uuid) to authenticated;
grant execute on function public.delete_journal_entry(uuid, text) to authenticated;
grant execute on function public.reorder_journal_entries(uuid, uuid[]) to authenticated;
