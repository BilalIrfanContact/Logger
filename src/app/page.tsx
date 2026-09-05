import { LandingReveal } from "./landing-reveal";

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="page-frame">
        <header className="site-header" aria-label="Kept">
          <a className="wordmark" href="/" aria-label="Kept home">
            KEPT
          </a>
          <nav className="landing-nav" aria-label="Account navigation">
            <a href="/login">Sign in</a>
            <a className="nav-cta" href="/register">Create account</a>
          </nav>
        </header>

        <section className="hero-grid" aria-labelledby="page-title">
          <LandingReveal className="hero-copy">
            <p className="eyebrow">A work journal for developers</p>
            <h1 id="page-title">Your work, in your words.</h1>
            <p className="hero-lede">
              Write raw notes, shape a review, and keep only what you approve.
            </p>
          </LandingReveal>

          <LandingReveal className="status-panel" delay={0.12}>
            <div className="status-panel-heading">
              <p className="panel-label">Foundation status</p>
              <span className="status-mark" aria-label="Application is running" />
            </div>
            <p className="status-title">The web application is running.</p>
            <p className="status-copy">
              Service readiness is available at <code>/api/health</code>.
            </p>
            <a className="status-link" href="/api/health">
              Open health check <span aria-hidden="true">↗</span>
            </a>
          </LandingReveal>
        </section>

        <footer className="site-footer">
          <span>Journal infrastructure</span>
          <span>Web foundation</span>
        </footer>
      </div>
    </main>
  );
}
