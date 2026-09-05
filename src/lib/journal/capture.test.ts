import { describe, expect, it } from "vitest";

import type { JournalCapture, JournalDay, RawNote } from "./capture";
import { createJournalCapture } from "./capture";

const now = new Date("2026-09-05T10:00:00.000Z");

function createMemoryCapture(): JournalCapture & {
  savedEntries: string[];
  revisions: Array<{ id: string; noteIds: string[]; contents: string[] }>;
} {
  const days = new Map<string, JournalDay>();
  const notes = new Map<string, RawNote>();
  const revisions: Array<{ id: string; noteIds: string[]; contents: string[] }> = [];
  const savedEntries = ["An approved entry remains independent of raw notes."];
  let nextId = 1;

  function makeDay(userId: string, journalDate: `${number}-${number}-${number}`, timezone: string): JournalDay {
    const day: JournalDay = {
      id: `day-${nextId++}`,
      userId,
      journalDate,
      timezone,
      midnightAt: "2026-09-05T00:00:00.000Z",
      dueAt: "2026-09-06T00:00:00.000Z",
      currentRevisionId: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    days.set(`${userId}:${journalDate}`, day);
    return day;
  }

  function createRevision(day: JournalDay) {
    const id = `revision-${nextId++}`;
    const dayNotes = [...notes.values()].filter((note) => note.journalDayId === day.id);
    revisions.push({ id, noteIds: dayNotes.map((note) => note.id), contents: dayNotes.map((note) => note.content) });
    day.currentRevisionId = id;
  }

  return {
    savedEntries,
    revisions,
    async getOrCreateJournalDay({ userId, journalDate, timezone }) {
      return days.get(`${userId}:${journalDate}`) ?? makeDay(userId, journalDate, timezone);
    },
    async getJournalDay({ userId, journalDate }) {
      const day = days.get(`${userId}:${journalDate}`);
      if (!day) return null;
      return {
        day,
        notes: [...notes.values()].filter((note) => note.userId === userId && note.journalDayId === day.id),
      };
    },
    async saveRawNote({ userId, journalDate, noteId, content }) {
      const day = days.get(`${userId}:${journalDate}`) ?? makeDay(userId, journalDate, "UTC");
      const existing = noteId ? notes.get(noteId) : undefined;
      if (existing && existing.userId !== userId) throw new Error("not owned");
      const note = existing ?? {
        id: `note-${nextId++}`,
        userId,
        journalDayId: day.id,
        content,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      note.content = content;
      note.updatedAt = now.toISOString();
      notes.set(note.id, note);
      createRevision(day);
      return note;
    },
    async deleteRawNote({ userId, noteId }) {
      const note = notes.get(noteId);
      if (!note || note.userId !== userId) throw new Error("not owned");
      const day = [...days.values()].find((candidate) => candidate.id === note.journalDayId);
      notes.delete(noteId);
      if (day) createRevision(day);
    },
  };
}

describe("journal day and raw-note capture", () => {
  it("enforces one day per user/date and keeps the first timezone snapshot", async () => {
    const repository = createMemoryCapture();
    const capture = createJournalCapture(repository, () => now);
    const first = await capture.openJournalDay("user-a", "2026-09-04", {
      locale: "en-US",
      timezone: "Asia/Karachi",
    });
    const second = await capture.openJournalDay("user-a", "2026-09-04", {
      locale: "en-US",
      timezone: "UTC",
    });

    expect(second.day.id).toBe(first.day.id);
    expect(second.day.timezone).toBe("Asia/Karachi");
  });

  it("allows an empty past day but rejects a future date", async () => {
    const repository = createMemoryCapture();
    const capture = createJournalCapture(repository, () => now);
    await expect(
      capture.openJournalDay("user-a", "2026-09-04", { locale: "en-US", timezone: "UTC" }),
    ).resolves.toMatchObject({ notes: [] });
    await expect(
      capture.openJournalDay("user-a", "2026-09-06", { locale: "en-US", timezone: "UTC" }),
    ).rejects.toThrow("Future dates cannot be opened");
  });

  it("edits and deletes a note without changing its identity", async () => {
    const repository = createMemoryCapture();
    const capture = createJournalCapture(repository, () => now);
    const created = await capture.saveRawNote("user-a", "2026-09-05", { locale: "en-US", timezone: "UTC" }, null, "first words");
    const edited = await capture.saveRawNote("user-a", "2026-09-05", { locale: "en-US", timezone: "UTC" }, created.id, "corrected words");

    expect(edited.id).toBe(created.id);
    expect(edited.content).toBe("corrected words");
    await capture.deleteRawNote("user-a", created.id);
    await expect(repository.getJournalDay({ userId: "user-a", journalDate: "2026-09-05" })).resolves.toMatchObject({ notes: [] });
  });

  it("invalidates the old revision while preserving its immutable snapshot and saved entries", async () => {
    const repository = createMemoryCapture();
    const capture = createJournalCapture(repository, () => now);
    const created = await capture.saveRawNote("user-a", "2026-09-05", { locale: "en-US", timezone: "UTC" }, null, "original");
    const firstRevision = repository.revisions[0];
    const edited = await capture.saveRawNote("user-a", "2026-09-05", { locale: "en-US", timezone: "UTC" }, created.id, "edited");
    const current = await repository.getJournalDay({ userId: "user-a", journalDate: "2026-09-05" });

    expect(current?.day.currentRevisionId).toBe(repository.revisions[1].id);
    expect(current?.day.currentRevisionId).not.toBe(firstRevision.id);
    expect(firstRevision.contents).toEqual(["original"]);
    expect(edited.id).toBe(created.id);
    expect(repository.savedEntries).toEqual(["An approved entry remains independent of raw notes."]);

    await capture.deleteRawNote("user-a", created.id);
    expect(repository.revisions.at(-1)?.contents).toEqual([]);
    expect(repository.savedEntries).toEqual(["An approved entry remains independent of raw notes."]);
  });

  it("never returns another user's day or permits their note mutation", async () => {
    const repository = createMemoryCapture();
    const capture = createJournalCapture(repository, () => now);
    const note = await capture.saveRawNote("user-a", "2026-09-05", { locale: "en-US", timezone: "UTC" }, null, "private");

    await expect(repository.getJournalDay({ userId: "user-b", journalDate: "2026-09-05" })).resolves.toBeNull();
    await expect(capture.deleteRawNote("user-b", note.id)).rejects.toThrow("not owned");
    expect(note.content).toBe("private");
  });
});
