import type { AccountPreferences } from "@/lib/account/preferences";

import {
  assertJournalDateIsAvailable,
  type CalendarDate,
  getLocalCalendarDate,
} from "./date";

export type JournalDay = {
  id: string;
  userId: string;
  journalDate: CalendarDate;
  timezone: string;
  midnightAt: string;
  dueAt: string;
  currentRevisionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RawNote = {
  id: string;
  userId: string;
  journalDayId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type JournalCapture = {
  getOrCreateJournalDay: (input: {
    userId: string;
    journalDate: CalendarDate;
    timezone: string;
  }) => Promise<JournalDay>;
  getJournalDay: (input: {
    userId: string;
    journalDate: CalendarDate;
  }) => Promise<{ day: JournalDay; notes: RawNote[] } | null>;
  saveRawNote: (input: {
    userId: string;
    journalDate: CalendarDate;
    timezone: string;
    noteId: string | null;
    content: string;
  }) => Promise<RawNote>;
  deleteRawNote: (input: { userId: string; noteId: string }) => Promise<void>;
};

export function createJournalCapture(
  repository: JournalCapture,
  clock: () => Date = () => new Date(),
) {
  return {
    async openJournalDay(
      userId: string,
      requestedDate: string | undefined,
      preferences: AccountPreferences,
    ) {
      const now = clock();
      const journalDate = requestedDate ?? getLocalCalendarDate(now, preferences.timezone);
      assertJournalDateIsAvailable(journalDate, now, preferences.timezone);
      const day = await repository.getOrCreateJournalDay({
        userId,
        journalDate,
        timezone: preferences.timezone,
      });
      const current = await repository.getJournalDay({ userId, journalDate });
      return { day, notes: current?.notes ?? [] };
    },

    async saveRawNote(
      userId: string,
      requestedDate: string,
      preferences: AccountPreferences,
      noteId: string | null,
      content: string,
    ) {
      assertJournalDateIsAvailable(requestedDate, clock(), preferences.timezone);
      if (!content.trim()) {
        throw new Error("A raw note needs some text before it can be saved.");
      }
      if (content.length > 20_000) {
        throw new Error("Raw notes cannot exceed 20,000 characters.");
      }

      return repository.saveRawNote({
        userId,
        journalDate: requestedDate,
        timezone: preferences.timezone,
        noteId,
        content,
      });
    },

    async deleteRawNote(userId: string, noteId: string) {
      await repository.deleteRawNote({ userId, noteId });
    },
  };
}
