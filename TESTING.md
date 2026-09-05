# Testing

## Production-foundation smoke flow

This ticket establishes the application and deployment boundary. Run the following from a clean checkout:

1. Run `npm ci` and copy `.env.example` to `.env.local`.
2. Start the web app with `npm run dev`.
3. Open <http://localhost:3000> and confirm the Kept foundation page loads.
4. Open <http://localhost:3000/api/health>. With empty or placeholder Supabase values, confirm it returns `503` and does not display a key or provider response.
5. Set valid Supabase URL and anon-key values, restart the dev server, and confirm the health endpoint returns `200` when Supabase Auth is reachable.
6. Run `npm run worker -- --once` and confirm the worker starts and exits without journal or AI behavior.
7. Run `npm run typecheck`, `npm test`, and `npm run test:e2e`.
8. Against a disposable Supabase project, run `supabase db push`, confirm `public.organization_jobs` exists, and verify an authenticated user can only access rows with their own `user_id`.

The automated browser test uses the local Next.js server and does not call a real Supabase project when configuration is absent.

## Kept branding

1. Start the web app with `npm run dev` and open <http://localhost:3000>.
2. Confirm the browser title is `Kept`.
3. Confirm the header announces `Kept`, the visible wordmark reads `KEPT`, and the home link is named `Kept home` to assistive technology.
4. Search the tracked repository files outside `TESTING.md` for `Logger` (for example, `git grep -n -i Logger -- ':!TESTING.md'`). Confirm the only matches are the explicit history note, legacy spec-path stub, and preserved GitHub repository links.

## Foundation landing page UI

1. Start the web app with `npm run dev` and open <http://localhost:3000>.
2. Confirm the page uses the warm monochrome layout with a split hero and a Foundation status panel.
3. Confirm the Foundation status panel links to `/api/health` and the link opens the JSON health response.
4. Resize below 768px and confirm the hero stacks into one column without horizontal scrolling.
5. Check both light and dark system appearances. Confirm text, borders, and the green status accent remain readable.
6. Enable `prefers-reduced-motion` in browser accessibility settings and reload. Confirm content appears without the entry movement.

## Private accounts and authenticated app shell (#16)

Against a disposable Supabase project with email confirmations enabled and Google/GitHub providers configured:

1. Set the public Supabase values, the server-only `SUPABASE_SERVICE_ROLE_KEY`, and the deployed origin in `.env.local`. Apply migrations with `supabase db push`.
2. Open `/register`, create an account, and confirm that the app does not grant access before email verification. Follow the verification email and confirm it lands on `/app`.
3. Sign out, sign back in with email/password, and confirm `/app` and `/app/account` are available. Confirm the account email, locale, and timezone appear in the shell.
4. From `/login`, exercise the Google and GitHub buttons with the configured disposable OAuth applications. Confirm each returns through `/auth/callback` to the protected shell.
5. Use `/forgot-password`, follow the reset email, set a new password, and confirm the old password no longer signs in.
6. Confirm an unauthenticated browser is redirected from `/app` and `/app/account` to `/login`, and sign-out returns to the public landing page.
7. Change locale and timezone on `/app/account`, reload, and confirm the saved values remain stable. Use an IANA timezone such as `Asia/Karachi`, not a UTC offset.
8. Create two disposable users and verify each sees only its own profile. Attempting to read or update the other user's profile through Supabase should return no row or an authorization error under RLS.
9. Type `DELETE` in the account deletion confirmation. Confirm the user is signed out, the profile and all rows with an `auth.users` cascade are gone, and the deleted credentials cannot sign in again.

The focused Vitest coverage uses injected auth/deletion dependencies and local validation; it never calls Supabase Auth or an OAuth provider. With provider configuration absent, the browser smoke test still verifies the public landing page and safe degraded health response.

## Journal days and raw notes (#17)

Against a disposable Supabase project with email confirmations enabled:

1. Apply the migrations with `supabase db push`, start the app, register and verify a test account, then sign in and open `/app`.
2. Confirm today opens with the saved account timezone shown. Type a raw note and wait for the `Saved` status; reload and confirm the note remains.
3. Add a second note and confirm both notes remain separate. Edit the first note, reload, and confirm it changed in place rather than appearing as a duplicate.
4. Delete the second note and reload. Confirm it is gone while the first note is unchanged.
5. Open yesterday with the date picker. Confirm an empty past journal day opens and can accept a late note. Try a future date and confirm the page refuses to open it.
6. Change the account timezone, return to a previously created journal day, and confirm its displayed timezone and local note times still use the day's original timezone. Open a new day and confirm it uses the new account timezone.
7. Create a second disposable account. Confirm it cannot see, edit, or delete the first account's journal days or raw notes. Verify the database contains one `journal_days` row per user/date and that raw-note IDs remain stable through edits.
8. Inspect the revision rows for the day. Confirm each note mutation advances the current revision, prior revision snapshots remain unchanged, and deleting a raw note does not alter any saved-entry rows.

The focused Vitest coverage uses a deterministic clock and a controlled persistence boundary to cover date guards, per-user uniqueness, timezone snapshots, note identity, revision invalidation, ownership, and saved-entry preservation. It does not call a real AI provider or depend on midnight timing.

## Manual saved entries and projects (#18)

Against a disposable Supabase project with email confirmations enabled:

1. Apply the migrations with `supabase db push`, start the app, register and verify a test account, then sign in and open `/app`.
2. Open today or a past journal day and add a saved entry without adding or organizing a raw note. Confirm it appears in the saved-entry section and survives a reload.
3. Create a project from `/app/projects`. Add another saved entry assigned to it, then edit the entry text and project. Confirm the entry ID and project relationship remain stable through edits.
4. Leave an entry Uncategorized, then confirm its project selector shows `Uncategorized` and no project row is created for it.
5. Add several entries and use Move up/Move down. Confirm the selected order survives a reload and newly created entries appear at the top before a manual reorder.
6. Rename the project and confirm existing entries still show the renamed project. Archive it, confirm it remains available in the archived list, then restore it.
7. Create or archive a duplicate-name project with different casing and repeated whitespace. Confirm active names cannot duplicate after normalization, and restoring an archived conflict is refused.
8. Merge two projects after the explicit confirmation. Confirm all source entries now reference the target project and the source project is gone. Permanently delete the target by typing its exact name and confirm its related entries are removed.
9. Create a second disposable account. Confirm it cannot list, edit, reorder, merge, archive, restore, or delete the first account's projects or journal entries through the protected UI or `/api` routes. Confirm raw notes and journal revision rows remain present and unchanged after saved-entry and project operations.

The focused Vitest coverage uses controlled in-memory repository doubles at the use-case boundary. It verifies privacy, entry CRUD and deterministic reorder, Uncategorized assignment, confirmation guards, normalized project uniqueness, rename identity, archive/restore, merge relationships, and project-delete cascade behavior. It does not call Supabase or an AI provider.
