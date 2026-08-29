# V1 deployment and operations

- Status: Accepted
- Scope: Wayfinder ticket 11, `Define V1 deployment and operational constraints`

V1 runs as a small production-only managed stack. Vercel hosts the web app and normal backend requests, Supabase hosts authentication and the database, and Railway runs the background worker. A separate staging environment will be added when the project needs it.

## Deployment

- Production deployments are triggered manually.
- Keep the previous working deployment available for rollback.
- Apply database changes through versioned migrations. Test migrations before production and take a backup before applying them.
- Store secrets in Vercel and Railway's encrypted environment variables. Never commit them to GitHub. Local development uses an ignored `.env` file.

## Jobs and limits

- A lightweight scheduler checks for due journal days every five minutes using an indexed due-time query. It queues work rather than running AI during the check and catches up after downtime.
- After its allowed retries, a failed AI job stays Failed. The app keeps the raw notes and offers a manual Retry action. Jobs never retry forever.
- Enforce the existing AI limits: 10 jobs per user per rolling 24 hours, 20,000 input characters per request, and one active job per journal revision. Retries do not bypass the user limit.
- Database ownership rules restrict every user's journals, notes, entries, and projects to that user. The backend checks ownership as a second layer.

## Logs and alerts

- Log only job or request IDs, user IDs, success or failure, duration, retry count, and error type.
- Never log raw notes, saved entries, AI text, passwords, or secret values.
- Send system alerts by email to the project owner for app or API outages, database or authentication outages, repeated worker failures, a growing midnight-job backlog, or backup failures.
- Show an individual user's failed AI job in the app without sending a system alert.

## Backups and recovery

- Keep provider-managed database backups enabled.
- Also create an encrypted full-database backup on the local machine every 48 hours.
- Keep the latest seven local backups, giving about two weeks of recovery points.
- V1 accepts up to 48 hours of data loss after a severe failure and targets restoration within one day.

## Consequences

V1 accepts the operational limits of a small production-only system. There is no staging environment, automated production deployment, selective backup, or high-availability setup yet. The local backup must be protected because it contains private journal data.
