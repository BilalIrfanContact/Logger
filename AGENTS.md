# AGENTS.md

## Project

Logger is a private, multi-user work journal for developers. Users write raw notes during the day. AI organizes those notes into an editable review. Only the user's approved review becomes saved journal entries.

V1 is a web-only product. Mobile support is not part of the current design or implementation.

## Source of truth

Read these files before making changes that affect their area:

- `CONTEXT.md` for domain vocabulary and boundaries.
- `docs/specs/logger-v1-implementation-spec.md` for the complete V1 behavior.
- `docs/decisions/` for accepted architectural decisions.
- GitHub issues for the current implementation ticket, acceptance criteria, and blockers.

When sources disagree, stop and resolve the disagreement before coding. Ask the user when the documents do not provide an answer. Do not silently invent behavior.

## Testing

Test user-visible behavior at the authenticated application boundary. The main flow is:

sign in → add raw notes → organize with AI → edit and save the review → browse the calendar → open project history → export

Use controlled fixtures or test doubles for the AI provider, clock, worker, scheduler, and database state. Tests must not call the real AI provider or depend on real midnight timing.

At minimum, cover:

- Privacy between two authenticated users.
- Raw-note autosave, edit, delete, and retention.
- Review approval and the rule that AI cannot save by itself.
- Retry behavior without duplicate entries.
- Calendar markers, date navigation, today default, empty past dates, and disabled future dates.
- Timezone boundaries and old journal-day timezone snapshots.
- Project history ordering and Uncategorized history.
- Export contents, exclusions, stable IDs, and versioning.
- AI timeouts, malformed output, permanent failures, retry exhaustion, and limits.

Use Vitest for focused application and provider-adapter tests. Use Playwright for the authenticated end-to-end flow.

After implementing a ticket or user-visible behavior, add it to `TESTING.md` with a clear heading and manual testing steps. Document the expected user workflow. Leave out small validation cases and internal implementation checks.

## Completion checklist

Before declaring a ticket complete:

- Acceptance criteria are satisfied.
- Focused tests cover the changed behavior.
- The relevant authenticated flow still works.
- `git diff --check` passes.
- No secrets or unrelated files are included.
- The ticket, commit, and pull request describe what changed and what was verified.
