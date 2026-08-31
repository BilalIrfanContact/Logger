# Testing

## Production-foundation smoke flow

This ticket establishes the application and deployment boundary. Run the following from a clean checkout:

1. Run `npm ci` and copy `.env.example` to `.env.local`.
2. Start the web app with `npm run dev`.
3. Open <http://localhost:3000> and confirm the Logger foundation page loads.
4. Open <http://localhost:3000/api/health>. With empty or placeholder Supabase values, confirm it returns `503` and does not display a key or provider response.
5. Set valid Supabase URL and anon-key values, restart the dev server, and confirm the health endpoint returns `200` when Supabase Auth is reachable.
6. Run `npm run worker -- --once` and confirm the worker starts and exits without journal or AI behavior.
7. Run `npm run typecheck`, `npm test`, and `npm run test:e2e`.

The automated browser test uses the local Next.js server and does not call a real Supabase project when configuration is absent.
