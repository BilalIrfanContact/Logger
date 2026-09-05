import Link from "next/link";

import type { ReactNode } from "react";

export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-frame">
        <header className="auth-header">
          <Link className="wordmark" href="/" aria-label="Kept home">KEPT</Link>
          <span>Private by default</span>
        </header>
        {children}
        <p className="auth-footer">Your journal belongs to you.</p>
      </div>
    </main>
  );
}
