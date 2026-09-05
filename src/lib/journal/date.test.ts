import { describe, expect, it } from "vitest";

import {
  assertJournalDateIsAvailable,
  formatNoteTime,
  getLocalCalendarDate,
  isCalendarDate,
} from "./date";

describe("journal date behavior", () => {
  it("groups an instant by the user's local timezone around midnight", () => {
    expect(getLocalCalendarDate(new Date("2026-09-05T23:30:00.000Z"), "Asia/Karachi")).toBe("2026-09-06");
    expect(getLocalCalendarDate(new Date("2026-09-05T23:30:00.000Z"), "America/New_York")).toBe("2026-09-05");
  });

  it("validates calendar dates and rejects future dates", () => {
    expect(isCalendarDate("2026-02-29")).toBe(false);
    expect(isCalendarDate("2026-09-05")).toBe(true);
    expect(() => assertJournalDateIsAvailable("2026-09-06", new Date("2026-09-05T10:00:00.000Z"), "UTC"))
      .toThrow("Future dates cannot be opened");
  });

  it("formats a note timestamp in the journal day's timezone and locale", () => {
    expect(formatNoteTime("2026-09-05T23:30:00.000Z", "en-US", "Asia/Karachi")).toBe("4:30 AM");
    expect(formatNoteTime("2026-09-05T23:30:00.000Z", "en-GB", "Asia/Karachi")).toBe("04:30");
  });
});
