import { requireAuthenticatedUser } from "@/lib/auth/server";
import { getLocalCalendarDate, formatJournalDate } from "@/lib/journal/date";
import { createJournalCapture } from "@/lib/journal/capture";
import { getAccountPreferences } from "@/lib/supabase/account";
import { getSupabaseJournalCapture } from "@/lib/supabase/journal";

import { JournalDayCapture } from "./journal-day-capture";

type JournalPageProps = {
  searchParams?: Promise<{ date?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function JournalShellPage({ searchParams }: JournalPageProps) {
  const user = await requireAuthenticatedUser();
  const preferences = await getAccountPreferences(user.id);
  const now = new Date();
  const today = getLocalCalendarDate(now, preferences.timezone);
  const query = await searchParams;
  const requestedDate = Array.isArray(query?.date) ? query.date[0] : query?.date;
  const capture = createJournalCapture(await getSupabaseJournalCapture(), () => now);

  try {
    const journal = await capture.openJournalDay(user.id, requestedDate, preferences);
    return (
      <section className="journal-page" aria-labelledby="journal-title">
        <div className="journal-heading">
          <div>
            <p className="eyebrow">Raw notes · {journal.day.timezone}</p>
            <h1 id="journal-title">{formatJournalDate(journal.day.journalDate, preferences.locale)}</h1>
            <p className="journal-copy">Capture what happened in your own words. Each note is saved as you write it.</p>
          </div>
          <form className="date-picker" method="get">
            <label className="field">
              <span>Open a journal day</span>
              <input type="date" name="date" defaultValue={journal.day.journalDate} max={today} />
            </label>
            <button className="button button-secondary" type="submit">Open date</button>
          </form>
        </div>
        <JournalDayCapture
          date={journal.day.journalDate}
          timezone={journal.day.timezone}
          locale={preferences.locale}
          notes={journal.notes}
        />
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "This journal day could not be opened.";
    return (
      <section className="journal-page" aria-labelledby="journal-title">
        <div className="journal-heading">
          <div>
            <p className="eyebrow">Raw notes</p>
            <h1 id="journal-title">Choose a journal day.</h1>
            <p className="form-message form-error" role="alert">{message}</p>
          </div>
          <form className="date-picker" method="get">
            <label className="field">
              <span>Open a journal day</span>
              <input type="date" name="date" defaultValue={today} max={today} />
            </label>
            <button className="button button-secondary" type="submit">Open date</button>
          </form>
        </div>
      </section>
    );
  }
}
