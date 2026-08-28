# V1 authentication provider and session model

## Decision context

V1 needs multiple user accounts, private journals, email/password authentication, required email verification, Google and GitHub OAuth, password reset, logout, secure sessions, and manual account deletion.

## Findings

- Supabase Auth supports email/password authentication, email confirmation, and password reset flows. Production email confirmation and password reset require an SMTP setup. [Supabase password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- Supabase Auth supports Google and GitHub login. Each provider requires an OAuth application and callback configuration. [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google), [Supabase GitHub login](https://supabase.com/docs/guides/auth/social-login/auth-github)
- Supabase supports server-side sessions using cookies. Its SSR package handles cookie sessions and refresh-token rotation, and its server-side guidance recommends the PKCE flow for SSR applications. [Supabase server-side Auth](https://supabase.com/docs/guides/auth/server-side), [Supabase package selection](https://supabase.com/docs/guides/auth/choosing-a-server-package)
- A Supabase project includes a full Postgres database. Supabase documents Row Level Security as the mechanism for protecting tables when the client accesses the database, which fits per-user journal ownership. [Supabase database overview](https://supabase.com/docs/guides/database/overview)
- Supabase documents identity linking for OAuth and password identities. The application should preserve one account per verified email and allow the user to use multiple linked sign-in methods. [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)

## V1 decision

Use Supabase Auth and Supabase Postgres as the managed platform.

- Supabase Auth owns credentials, email verification, OAuth identities, password resets, and sessions.
- The application uses secure server-managed cookie sessions.
- Journal records use the Supabase Auth user ID as their ownership key.
- Every journal query and write must enforce that ownership boundary.
- Application-specific profile fields, if needed, belong in an application profile table rather than in authentication credentials.
- Account deletion remains a manual administrative operation in V1.

## Limitations and follow-up

- OAuth provider credentials, redirect URLs, email delivery, and production SMTP still need environment-specific configuration.
- The journal schema and Row Level Security policies belong to the persistence/data-model work, not this provider decision.
