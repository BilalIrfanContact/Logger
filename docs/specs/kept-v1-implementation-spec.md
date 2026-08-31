# Kept V1 implementation specification

## Problem Statement

Developers often remember their work only as a scattered stream of thoughts, fixes, meetings, and discussions. Turning that stream into useful project history takes enough manual effort that it often does not happen.

Kept should let a developer record what happened in their own words, preserve those raw notes, and make the information easy to revisit by journal day or project. AI should help organize the notes, but the user must remain the final authority over saved journal data.

## Solution

Build a private, multi-user developer work journal with this core flow:

1. The user opens today or a past journal day.
2. The user adds raw notes in natural language throughout the day.
3. Kept automatically organizes the day's notes at local midnight. Adding notes to an older day triggers organization immediately.
4. AI produces an editable review of suggested journal entries. It never writes directly to saved entries.
5. The user edits, removes, adds, reorders, assigns, or leaves suggestions uncategorized, then explicitly saves the review.
6. Kept stores saved entries under a journal day and an optional project.
7. The user retrieves saved work through a monthly calendar, a journal card, project history, or Uncategorized history.
8. The user can export the complete durable journal as one versioned JSON file.

The product should feel like a personal journal, not a task manager. The user sees useful work history and control over AI output without being exposed to internal processing machinery.

## User Stories

### Accounts and privacy

1. As a developer, I want to create an account with email and password, so that I can keep a private journal.
2. As a developer, I want to verify my email address, so that my account has a confirmed identity.
3. As a developer, I want to sign in with Google, so that I can access Kept without creating another password.
4. As a developer, I want to sign in with GitHub, so that Kept fits my developer workflow.
5. As a developer, I want to reset my password, so that I can recover access if I forget it.
6. As a signed-in user, I want to sign out, so that another person using my device cannot access my journal.
7. As a user, I want my journal data isolated from every other user, so that my work history remains private.
8. As a user, I want to delete my account manually, so that I can remove my Kept data when I choose.

### Journal days and raw notes

9. As a user, I want one journal day for each local calendar date, so that all of a day's notes stay together.
10. As a user, I want to add several raw notes to one journal day, so that I can record work as it happens.
11. As a user, I want each raw note preserved as its own piece of source text, so that AI organization never destroys my original words.
12. As a user, I want to edit a raw note in place, so that I can correct what I wrote without creating confusing duplicates.
13. As a user, I want to delete a raw note permanently, so that unwanted source material is removed.
14. As a user, I want to open an empty past journal day, so that I can add a late note for that date.
15. As a user, I want future dates to remain unavailable for journaling, so that Kept records work that has happened rather than future plans.
16. As a user, I want raw notes to remain available after AI processing, so that I can compare saved entries with what I originally wrote.

### AI organization and review

17. As a user, I want Kept to organize the current day's notes automatically at local midnight, so that I do not have to remember to process them.
18. As a user, I want adding a note to an older journal day to trigger organization immediately, so that late additions become useful without waiting for another midnight.
19. As a user, I want one active organization job per journal revision, so that repeated triggers do not create conflicting results.
20. As a user, I want AI to identify projects in my raw notes, so that related work is grouped together.
21. As a user, I want AI to recognize meetings, discussions, fixes, and other work as activities, so that the journal captures more than task names.
22. As a user, I want AI suggestions to remain editable, so that I can correct wrong wording or categorization.
23. As a user, I want AI to suggest an existing project when a note appears to match it, so that duplicate projects are less likely.
24. As a user, I want AI to leave uncertain work uncategorized or mark it for review, so that Kept does not invent a project.
25. As a user, I want to see the current review when processing finishes, so that I know what AI proposes before anything is saved.
26. As a user, I want processing failures to leave my raw notes intact, so that a temporary service problem does not lose my work.
27. As a user, I want to retry a failed organization job, so that I can recover without retyping my notes.
28. As a user, I want a late organization run to consider saved entries as read-only context, so that new suggestions do not overwrite earlier saved work.
29. As a user, I want an edited raw note to make its related review outdated, so that I do not mistake an old review for current AI output.

### Saving and editing journal entries

30. As a user, I want to approve a review before it creates saved entries, so that AI never becomes the final authority over my journal.
31. As a user, I want to edit a suggested activity before saving, so that the saved entry reflects what I actually did.
32. As a user, I want to delete an incorrect suggestion before saving, so that it never enters my journal history.
33. As a user, I want to change a suggestion's project, so that the saved entry appears in the correct project history.
34. As a user, I want to save an entry without a project, so that useful work is not forced into a made-up category.
35. As a user, I want to add an entry manually without AI, so that I can keep journaling when I do not need organization.
36. As a user, I want to edit a saved entry in place, so that I can keep my history accurate.
37. As a user, I want to delete a saved entry with confirmation, so that accidental deletion is less likely.
38. As a user, I want to reorder saved entries manually, so that I can present a day in the order that makes sense to me.
39. As a user, I want new entries to appear newest first by default, so that the latest work is easiest to see.
40. As a user, I want saved entries to remain unchanged when their source raw notes are edited or deleted, so that later source cleanup cannot silently rewrite my history.

### Projects

41. As a user, I want projects to be reusable across journal days, so that I can see the history of ongoing work.
42. As a user, I want active project names to be unique for me, so that one project does not split into accidental duplicates.
43. As a user, I want to rename a project, so that its current name is accurate while its history stays connected.
44. As a user, I want to merge duplicate projects explicitly, so that I control how histories are combined.
45. As a user, I want to archive a project without losing its entries, so that inactive work remains available.
46. As a user, I want to restore an archived project, so that I can use it again when work resumes.
47. As a user, I want to permanently delete a project with strong confirmation, so that I can remove a project and its related history intentionally.
48. As a user, I want projects to be the V1 categorization system, so that Kept stays simpler than a task-management tool.

### Calendar and journal retrieval

49. As a user, I want a monthly calendar grid, so that I can browse my journal by date.
50. As a user, I want dates with raw notes or saved entries to have a simple marker, so that I can find days with content quickly.
51. As a user, I want today selected when the calendar opens, so that Kept starts at the most relevant date.
52. As a user, I want previous and next month controls, so that I can move through my history.
53. As a user, I want a Today button, so that I can return to the current date quickly.
54. As a user, I want to open a selected date in a large journal card over the calendar, so that I can read or edit the day without losing my place.
55. As a user, I want an empty past date to open as a blank journal card, so that I can add a late note there.
56. As a user, I want processing details to appear inside the journal card rather than on the calendar grid, so that the calendar stays simple.
57. As a user, I want dates and times displayed in my saved regional format, so that the journal feels familiar.
58. As a user, I want exact local times shown on notes and entries, so that I can understand when work happened.

### Project history

59. As a user, I want to open project history by selecting a project name, so that I can see all saved work for that project.
60. As a user, I want project history grouped by journal date, so that the progression of work is easy to follow.
61. As a user, I want the newest journal dates first, so that recent project work is easiest to find.
62. As a user, I want project history to show saved entries only, so that temporary raw notes and AI reviews do not clutter the history.
63. As a user, I want archived projects and their history available in an archived section, so that archiving does not hide my past work.
64. As a user, I want an Uncategorized history, so that saved entries without projects remain easy to find.
65. As a user, I want project history to use the same large-card style as journal days, so that navigation feels consistent.
66. As a user, I want a clear empty message when a project has no entries, so that I understand there is no history yet.
67. As a user, I want calendar navigation and project selection to be enough for V1, so that the product does not become cluttered with search and filters.

### Locale, timezone, and account preferences

68. As a new user, I want Kept to detect an initial locale from my browser or device, so that date formatting works without setup work.
69. As a new user, I want Kept to detect an initial timezone from my browser or device, so that midnight follows my local day.
70. As a user, I want to change my saved locale, so that date formats and week start match my preference.
71. As a user, I want to change my saved timezone, so that future journal days use the timezone I choose.
72. As a traveling user, I want my chosen locale and timezone to remain stable until I change them, so that travel does not unexpectedly move notes between days.
73. As a user, I want an existing journal day to retain its timezone snapshot, so that changing my account timezone does not rewrite old dates.
74. As a user, I want notes after local midnight to belong to the new journal day, so that daily boundaries match my local experience.

### Export

75. As a user, I want to export my complete journal, so that I have a backup I can keep independently.
76. As a user, I want the export to contain raw notes, saved entries, projects, archived projects, dates, and timestamps, so that it preserves my durable journal data.
77. As a user, I want project IDs preserved in the export, so that entries remain connected to their projects.
78. As a user, I want uncategorized entries represented without a project, so that they are not turned into fake projects.
79. As a user, I want export to download immediately as one JSON file, so that I can save my data without a multi-step workflow.
80. As a user, I want the export to include a format version, so that future versions can understand older files.
81. As a user, I want temporary AI reviews and technical job records excluded, so that the export contains journal data rather than internal processing history.
82. As a user, I want empty dates and deleted records excluded, so that the export contains only meaningful retained data.

## Implementation Decisions

### Application boundaries

- Build the application around a single authenticated journal workflow boundary. It owns user-facing journal actions and coordinates authentication, persistence, AI organization, retrieval, and export.
- Build the web application with TypeScript, React, and the Next.js App Router. Use Next.js server-side code and Route Handlers for the application boundary and normal backend requests. V1 does not have a separate Express or NestJS API server.
- Use Tailwind CSS for the interface. Use Vitest for focused tests and Playwright for the authenticated end-to-end flow.
- Use Supabase Auth, Postgres, and Row Level Security. Use `@supabase/ssr` for secure cookie-based sessions.
- Deploy the Next.js application to Vercel. Run the Node.js background worker on Railway. Keep long-running AI and scheduler work in the worker instead of request handlers.
- Use the OpenAI JavaScript SDK and Responses API with the fixed server-side `gpt-5.6-luna` model. Use Zod for application input validation and JSON Schema for the AI output contract.
- Store organization job state in Supabase tables. Do not add Redis or another queue service in V1.
- Keep provider-specific details behind adapters for Supabase, the OpenAI Responses API, Vercel runtime concerns, and Railway worker execution.
- Keep raw notes, AI reviews, and saved journal entries as separate concepts and records. No AI path may write directly to saved entries.
- Use the domain terms in `CONTEXT.md` as the canonical vocabulary: user, journal day, raw note, AI review, review suggestion, journal entry, project, Uncategorized entry, calendar grid, journal card, and project history.

### Authentication and ownership

- Use Supabase Auth for email/password, email verification, password reset, Google OAuth, GitHub OAuth, logout, and session management.
- Use secure server-managed cookie sessions with the Supabase user ID as the ownership key.
- Every journal day, raw note, saved entry, and project belongs to one user. Enforce ownership in database policies and in backend authorization checks.
- Account deletion is a manual V1 operation. It must remove the user's private journal data and authentication account according to the agreed deletion workflow.

### Persistence model

- Store one journal day per user and local calendar date. Enforce uniqueness for that user/date pair.
- Use UUIDs for domain records and UTC timestamps for exact event times.
- A journal day stores its local calendar date and the journal timezone snapshot used to interpret it.
- Store every raw note as a separate editable record with its own timestamps.
- Store projects as independent reusable user-owned records. Project names are unique among active projects using case-insensitive, whitespace-normalized matching.
- Store each saved activity as a separate journal entry with an optional project, editable text, AI or manual origin, timestamps, and display order.
- Link AI-created entries to source raw notes. Support many-to-many source relationships because several notes can form one entry and one note can form several entries. Manual entries have no source-note link.
- Store organization jobs and review suggestions separately from saved entries. Keep enough metadata to show current review state, retries, model, provider response ID, and concise errors without exposing technical history to users.
- Use review states Draft, Processing, Review ready, Saved, and Failed. Raw notes do not show a user-facing processing state.
- Editing a raw note keeps its ID, updates its timestamp, and marks related review output outdated. It must not change saved entries automatically.
- Deleting a journal day removes its raw notes, organization jobs and reviews, and journal entries, but keeps projects. Deleting a raw note removes pending suggestions based on it while keeping saved entries. Deleting a saved entry keeps its project.

### Journal workflow

- Autosave raw notes before organization begins.
- Organize current-day notes automatically at local midnight in the journal day's timezone.
- Organize additions to older days immediately after the user adds them.
- Allow manual retry after a failed job. Never retry forever.
- Show the current AI review as editable suggestions. A user must explicitly approve and save before suggestions become journal entries.
- On review save, create or update only the entries represented by the approved review. Never overwrite unrelated saved entries.
- Allow users to skip AI and add or save entries manually.
- Warn before leaving with unsaved review or entry changes where the UI holds unsaved edits.

### AI contract and processing

- Use `gpt-5.6-luna` through the Responses API with strict Structured Outputs and a server-owned JSON Schema.
- Start with low reasoning effort. Re-evaluate medium reasoning effort only after representative evaluation data shows missed categories or poor grouping.
- Use one fixed server-side model for V1. Do not expose model selection to users.
- Send only relevant raw notes, stable source-note IDs, the journal date, and read-only saved-entry context needed to avoid duplicates.
- Require structured suggested entries, unresolved notes with short reasons, and an optional short day summary. Validate the parsed result on the server.
- Use background processing. The web request creates a durable organization job and returns its status. The worker stores the provider response ID, polls background responses, retrieves terminal results, validates them, and stores normalized review data.
- Enforce a 20,000-character input limit, 4,096 maximum output tokens, 10 organization jobs per user in a rolling 24-hour period, and one active job per journal revision. Retries do not bypass the user limit.
- Use a 30-second network timeout, a five-minute job deadline, and two retries after the initial attempt for transient failures with exponential backoff and jitter. Do not retry permanent validation, refusal, authentication, or other permanent 4xx failures.
- Preserve raw notes when a job fails. Mark the job Failed and offer a Retry action.
- Do not use Batch API in the V1 user path.

### Project behavior

- AI may suggest a new project or an existing project, but project creation happens only when the user saves the review.
- AI must not silently merge projects. Merging is an explicit user-confirmed action.
- Renaming a project changes its display name while stable identity keeps historical entries connected.
- Archiving keeps entries and history available in an archived section and allows restoration.
- Permanent project deletion removes its entries and related history after strong confirmation.
- Do not add separate freeform tags in V1.

### Calendar and retrieval interfaces

- Provide a monthly calendar grid with one simple content marker for dates containing raw notes or saved entries.
- Select today by default. Show future dates but disable opening them. Allow today and past dates, including empty past dates, to open.
- Provide previous-month, next-month, and Today controls.
- Open a selected journal day in a large journal card overlay that leaves the calendar visible behind it.
- Use the saved locale for readable dates, times, and calendar week start. Show local times on notes and entries.
- Let project names open project history in the same large-card style.
- Group project history by journal date, newest first. Show saved entries only. Include archived projects and a separate Uncategorized history.
- Do not add search or advanced filters in V1.

### Locale and timezone

- Detect initial locale and timezone from the browser or device during account setup, then save them as account preferences.
- Store an IANA timezone such as `Asia/Karachi`, not only a UTC offset.
- Use the journal day's timezone snapshot for local date grouping and midnight processing.
- Account timezone changes apply only to new journal days. Existing journal days keep their date and timezone snapshot.
- Locale and timezone are independent. Travel or a device setting change does not automatically change either saved preference.
- Use ISO 8601 UTC timestamps internally for exact events and the saved locale for display.

### Export

- Provide export only in V1. Do not implement import.
- Produce one complete JSON file with format version `1` and an export timestamp.
- Include populated journal days, their local date and timezone, raw notes, saved entries, and all projects including archived projects.
- Preserve stable project IDs. Use `null` for an entry without a project.
- Store exact timestamps as ISO 8601 UTC values.
- Exclude temporary AI reviews, organization jobs, provider metadata, deleted records, and empty journal days.
- Download immediately with a filename like `kept-export-2026-08-29.json`.
- Do not offer date or project selection for V1.

### Deployment and operations

- Use a production-only managed setup for V1.
- Vercel hosts the Next.js web app and normal Route Handler backend requests. Supabase hosts authentication and the database. Railway runs the Node.js background worker.
- Add a separate staging environment only when the project needs it.
- Trigger production deployments manually. Keep the previous working deployment available for rollback.
- Use versioned database migrations. Test migrations before production and take a backup before applying them.
- Store secrets in Vercel and Railway encrypted environment variables. Never commit secrets to GitHub. Use an ignored local `.env` file for development.
- Run a lightweight indexed scheduler every five minutes. It queues due journal-day work, does not run AI during the check, and catches up after downtime.
- Log only request or job IDs, user IDs, outcome, duration, retry count, and error type. Never log raw notes, saved entries, AI text, passwords, or secrets.
- Email the project owner about app or API outages, database or authentication outages, repeated worker failures, a growing midnight-job backlog, or backup failures. Show an individual failed AI job in the app without sending a system alert.
- Keep provider-managed database backups enabled. Also create an encrypted full-database backup on the local machine every 48 hours and keep the latest seven local backups.
- V1 accepts up to 48 hours of data loss after a severe failure and targets restoration within one day.

## Testing Decisions

- Test external behavior at the authenticated application boundary. The primary seam is the complete user flow from sign-in through raw-note capture, AI organization, review, save, calendar retrieval, project history, and export.
- Use controlled fixtures or test doubles for the AI provider, clock, background worker, scheduler, and database state so the end-to-end tests are deterministic and do not spend money or depend on real midnight timing.
- Verify privacy through authenticated requests from two users. A user must never see or modify another user's journal days, raw notes, entries, projects, reviews, jobs, or exports.
- Verify the raw-note boundary: autosave before organization, edit and delete behavior, retention after processing, stale-review behavior, and preservation of saved entries.
- Verify the approval boundary: AI output stays temporary until save, user edits are saved, manual entries work, retries do not duplicate entries, and repeated organization never overwrites saved entries.
- Verify project behavior through user-visible outcomes: reuse, rename, archive, restore, merge, delete, Uncategorized entries, and project history ordering.
- Verify calendar behavior: month navigation, Today, markers, today default, empty past dates, disabled future dates, journal-card overlays, local dates, and locale-based week start.
- Verify timezone behavior around midnight, timezone changes, travel or device changes, daylight-saving transitions where the chosen timezone observes them, and preservation of old journal-day snapshots.
- Verify AI failure behavior for timeouts, transient errors, permanent errors, malformed structured output, retry exhaustion, rate limits, and job deadlines.
- Verify request limits and concurrency: 20,000-character input, 4,096 output limit, 10 jobs per rolling 24 hours, one active job per revision, and retry accounting.
- Verify export content and exclusions, JSON versioning, ISO UTC timestamps, stable project references, Uncategorized nulls, filename, immediate download, and omission of empty or deleted data.
- Verify operations behavior with migration checks, rollback readiness, backup creation and restore, privacy-safe logs, alert conditions, scheduler catch-up, and secret handling.
- No automated test suite exists in the repository yet, so there is no prior test pattern to preserve. Establish the authenticated end-to-end flow as the first testing foundation, then add focused contract tests only where the provider boundaries require them.
- Use Playwright for the authenticated end-to-end flow and Vitest for focused application and provider-adapter tests. Keep both suites deterministic with the fixtures and test doubles described above.

## Out of Scope

- Journal import, duplicate resolution for imported data, invalid import-file handling, and selective exports.
- Time tracking, timers, task status, priorities, estimates, progress percentages, productivity scores, and broad project-management features.
- Collaboration, shared journals, teams, comments, permissions beyond private ownership, and public journal pages.
- Freeform tags separate from projects.
- Search, advanced filters, saved searches, and analytics dashboards.
- Future-date journaling and future planning.
- Automatic project merging or automatic rewriting of saved entries.
- User-selectable AI models, multiple AI providers, Batch API for the user path, and open-ended AI chat.
- Automated production deployment, high availability, multi-region deployment, and permanent staging infrastructure.
- User-visible technical job history, provider response data, retry details, and internal operational metadata.

## Further Notes

- The repository currently contains product requirements, domain context, decision records, research notes, and no application implementation. This spec is the implementation handoff for the first build.
- The accepted decision records remain the source of detail for persistence, calendar and history, date and timezone behavior, export, and operations.
- The user-facing product should hide internal terms such as organization job and provider response. Users should see raw notes, current review suggestions, saved entries, projects, and clear failure or retry actions.
- The project is ready to split into implementation tasks at the application boundary after this spec is accepted.
