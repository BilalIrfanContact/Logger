# Kept

Kept is a private work journal for developers. This repository contains the deployable V1 foundation, private Supabase-authenticated account shell, journal capture, and manual saved-entry/project workflow. AI organization and retrieval features arrive in later tickets.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm ci
cp .env.example .env.local
# Edit .env.local with the public values from your Supabase project.
npm run dev
```

The web app runs at <http://localhost:3000>. `GET /api/health` returns `200` when the Supabase configuration is present and Supabase Auth responds. It returns `503` with a safe, non-sensitive status when configuration is missing or the dependency cannot be reached.

Run the other local checks with:

```bash
npm run typecheck
npm test
npm run test:e2e
npm run worker -- --once
```

The worker stays a placeholder in this ticket. `--once` starts it and exits, which is useful for a local smoke check. Railway runs `npm run worker` as the long-lived service command.

The authenticated shell uses Supabase email/password, verification, password reset, Google/GitHub OAuth entry points, and secure server-managed cookies. Set `SUPABASE_SERVICE_ROLE_KEY` only on the server to enable manual account deletion.

## Supabase migrations

The repository keeps database changes in `supabase/migrations`. Before the first production deploy, link the Supabase CLI to the target project and apply the versioned migrations after taking a database backup:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The migrations create the private account profile, journal-day/raw-note, organization-job, and manual entry/project boundaries. They use ownership RLS; records tied to `auth.users` are removed when an account is deleted. AI review tables arrive in later tickets.

## Manual production deployment

Vercel hosts the Next.js web app and its Route Handlers. Create or link the Vercel project, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel environment settings, then deploy manually:

```bash
npx vercel link
npx vercel --prod
```

Keep the previous working Vercel deployment available for rollback. Confirm the deployment with `/api/health` before directing traffic to it.

Railway hosts the worker. Create a service for this repository, set its start command to `npm run worker` (also recorded in `railway.json`), and add the encrypted environment variables required by the worker as later tickets introduce them. Do not commit local or production secrets.
