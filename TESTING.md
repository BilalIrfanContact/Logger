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
