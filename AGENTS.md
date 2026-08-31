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

## Coding practices

Follow these principles:

- Build deep modules with small public APIs that hide real complexity.
- Minimize coupling; every responsibility should have a clear owner.
- Organize by domain and capability, not generic utils, services, or helpers.
- Keep business logic independent from frameworks, databases, and vendor SDKs.
- Push side effects to the edges; keep core logic deterministic and easy to test.
- Never leak module internals across boundaries.
- Reject premature abstractions, unnecessary interfaces, factories, and layers.
- Choose simple, explicit designs over clever or overly generic ones.
- Before major features, define the owning module and smallest useful public API.
- If a request creates weak boundaries or tight coupling, propose a cleaner design before coding.

The goal is a codebase that is simple to use, easy to change, easy to test, and does not require callers to understand internal complexity.

## Branching strategy

- Keep `main` stable and deployable. Do not implement directly on `main`.
- Create one short-lived branch per ticket from the latest `main`.
- Name branches after the change, without ticket numbers. Use prefixes such as `feat/`, `fix/`, `docs/`, or `chore/`.
- Use names such as `feat/production-foundation`, `fix/session-cookie`, or `docs/export-spec`.
- Keep each branch limited to one ticket. If the ticket is too large, stop and split it before expanding the branch scope.
- Open one pull request per ticket branch and merge it into `main` after the acceptance criteria and tests pass.
- Delete the branch after it has been merged.
- Do not create a long-lived `develop` or `staging` branch for V1.


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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
