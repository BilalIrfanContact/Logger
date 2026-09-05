import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import type { AccountPreferences } from "@/lib/account/preferences";

export function AppShell({
  email,
  preferences,
  children,
}: Readonly<{ email: string; preferences: AccountPreferences; children: React.ReactNode }>) {
  return (
    <main className="app-page">
      <div className="app-frame">
        <header className="app-header">
          <Link className="wordmark" href="/app" aria-label="Kept journal home">KEPT</Link>
          <nav className="app-nav" aria-label="Account navigation">
            <Link href="/app">Journal</Link>
            <Link href="/app/account">Account</Link>
            <form action={logoutAction}><button className="text-button" type="submit">Sign out</button></form>
          </nav>
        </header>
        <div className="app-meta">
          <span>{email}</span>
          <span>{preferences.locale} · {preferences.timezone}</span>
        </div>
        {children}
      </div>
    </main>
  );
}
