# V1 web technology stack

- Status: Accepted
- Scope: Logger V1

Logger V1 is a web-only application. Build it with TypeScript, React, and the Next.js App Router. Next.js server-side code and Route Handlers form the application boundary for normal backend requests, so V1 does not need a separate Express or NestJS API server. Use Tailwind CSS for the interface.

Use Supabase Auth, Postgres, and Row Level Security for accounts and persistence, with `@supabase/ssr` for secure cookie-based sessions. Vercel hosts the Next.js application and its normal backend requests. Railway runs the Node.js background worker for AI organization and scheduled work. Store job state in Supabase tables and do not add Redis in V1.

Use the OpenAI JavaScript SDK and Responses API with the fixed server-side `gpt-5.6-luna` model. Use Zod for application input validation and JSON Schema for the AI output contract. Use Vitest for focused tests and Playwright for the authenticated end-to-end flow.

This keeps the first release within two application runtimes and one managed database/auth provider. It also matches the agreed production-only deployment while leaving a clean boundary for a separate worker later. A mobile client is not part of this decision or V1 scope.

## Considered options

- A separate Express or NestJS backend would add another deployable service without solving a V1 requirement.
- Redis would add operational work when Supabase job tables already cover the V1 queue and recovery needs.
- A mobile-ready shared client architecture was left out after V1 was narrowed to web only.

## Consequences

- The web app and normal backend requests share one Next.js codebase and deploy to Vercel.
- Long-running AI and scheduler work stays out of request handlers and runs in the Railway worker.
- Provider-specific code must remain behind adapters so the application is not tied to Supabase or OpenAI calls throughout the domain code.
