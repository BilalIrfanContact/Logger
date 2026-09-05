import { isValidTimezone } from "../account/preferences";

export type CalendarDate = `${number}-${number}-${number}`;

export class FutureJournalDateError extends Error {
  constructor() {
    super("Future dates cannot be opened for journaling.");
    this.name = "FutureJournalDateError";
  }
}

export class InvalidJournalDateError extends Error {
  constructor() {
    super("Choose a valid calendar date.");
    this.name = "InvalidJournalDateError";
  }
}

export function isCalendarDate(value: string): value is CalendarDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function assertCalendarDate(value: string): asserts value is CalendarDate {
  if (!isCalendarDate(value)) {
    throw new InvalidJournalDateError();
  }
}

export function getLocalCalendarDate(now: Date, timezone: string): CalendarDate {
  if (!isValidTimezone(timezone)) {
    throw new RangeError(`Invalid IANA timezone: ${timezone}`);
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}` as CalendarDate;
}

export function assertJournalDateIsAvailable(
  journalDate: string,
  now: Date,
  timezone: string,
): asserts journalDate is CalendarDate {
  assertCalendarDate(journalDate);
  const today = getLocalCalendarDate(now, timezone);
  if (journalDate > today) {
    throw new FutureJournalDateError();
  }
}

export function formatJournalDate(
  journalDate: CalendarDate,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    dateStyle: "long",
  }).format(new Date(`${journalDate}T12:00:00.000Z`));
}

export function formatNoteTime(
  timestamp: string,
  locale: string,
  timezone: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(timestamp));
}
