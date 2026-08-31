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

## Foundation landing page UI

1. Start the web app with `npm run dev` and open <http://localhost:3000>.
2. Confirm the page uses the warm monochrome layout with a split hero and a Foundation status panel.
3. Confirm the Foundation status panel links to `/api/health` and the link opens the JSON health response.
4. Resize below 768px and confirm the hero stacks into one column without horizontal scrolling.
5. Check both light and dark system appearances. Confirm text, borders, and the green status accent remain readable.
6. Enable `prefers-reduced-motion` in browser accessibility settings and reload. Confirm content appears without the entry movement.
