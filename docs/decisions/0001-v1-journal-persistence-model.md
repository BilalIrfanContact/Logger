# ADR 0001: V1 journal persistence model

- Status: Accepted
- Scope: Wayfinder ticket 6, `Define V1 persistence and journal data model`

## Context

Logger has one journal for each user and calendar date. Users add raw notes during the day. AI organizes those notes at local midnight or immediately when the user adds notes to an older day. AI output stays in review until the user approves it.

## Final V1 model

The following entities are enough for V1:

### Journal days

One row per user and calendar date. Store a UUID, the Supabase user ID, the local calendar date, the IANA timezone used for that day, and UTC `created_at` and `updated_at` timestamps. Enforce a unique constraint on `(user_id, journal_date)`.

### Raw notes

Each user addition is its own row with a UUID, user ID, journal-day ID, editable content, and UTC `created_at` and `updated_at` timestamps. Raw notes have no user-facing processing status. They remain the source text until the user deletes them.

### Projects

Projects are independent user-owned rows with a UUID, user ID, canonical name, lifecycle state, and UTC timestamps. Entries reference projects by ID. Existing project naming, archive, merge, and delete rules remain governed by [Project identity and tagging behavior](https://github.com/BilalIrfanContact/Logger/issues/4).

### Organization jobs and reviews

An internal organization-job row records one AI event for a journal day. It stores the user ID, journal-day ID, trigger, model ID, provider response ID, lifecycle status, timestamps, retry count, and a concise error code when needed. A join table links each job to the raw notes it processed.

The job's structured review suggestions are stored separately and link back to the job and their source raw notes. A suggestion may link to multiple raw notes, and one raw note may produce multiple suggestions. Suggestions can hold an existing project ID, a proposed project name, an uncategorized state, a review reason, editable text, and display order. This information is internal apart from the current review shown to the user.

Use the agreed display states Draft, Processing, Review ready, Saved, and Failed. The storage may also track provider-level queue details internally.

### Journal entries

Each saved activity is its own row with a UUID, user ID, journal-day ID, nullable project ID, editable text, origin (`ai` or `manual`), display order, and UTC `created_at` and `updated_at` timestamps. A join table links AI-created entries to their source raw notes. Manual entries have no source-note links.

Entries are edited in place. V1 does not expose version history. New entries appear newest first by default, while the existing manual reorder behavior can update display order.

## Data rules

- All Logger records use UUIDs. Every record carries the Supabase user ID for ownership checks.
- Exact event times use UTC. User-facing grouping uses the journal's stored local date and timezone.
- AI never writes directly to journal entries. Saving a review creates or updates entries only after user approval.
- Deleting a journal day permanently deletes its raw notes, organization jobs and reviews, and journal entries. It does not delete project records.
- Deleting a raw note permanently removes that note and any pending suggestions based on it. Existing saved entries remain unchanged.
- Deleting a saved entry permanently removes that entry. Its project remains.
- Raw notes, saved entries, and internal job records are separate so retries and manual edits cannot overwrite the user's saved journal.

## Deferred implementation details

- Exact SQL table names and indexes beyond the required uniqueness constraint
- API endpoint and UI field names
- Whether to retain provider response JSON for a limited operational period; V1 requires normalized review data and metadata, not indefinite provider-response retention
