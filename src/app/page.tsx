export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Logger</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Your work, in your words.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-slate-300">
          A private work journal for developers. The application foundation is ready for the
          authenticated journal experience.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
        <p className="font-medium text-white">Foundation status</p>
        <p className="mt-2">The web application is running. Check <code>/api/health</code> for service readiness.</p>
      </div>
    </main>
  );
}
