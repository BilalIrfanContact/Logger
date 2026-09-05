import { describe, expect, it } from "vitest";

import type { JournalEntry, JournalEntryRepository } from "./entries";
import { createJournalEntryManager, ENTRY_DELETE_CONFIRMATION } from "./entries";

function createMemoryEntries() {
  const entries = new Map<string, JournalEntry>();
  let nextId = 1;
  const repository: JournalEntryRepository = {
    async listEntries({ userId, journalDayId }) {
      return [...entries.values()]
        .filter((entry) => entry.userId === userId && entry.journalDayId === journalDayId)
        .sort((a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
    },
    async createManualEntry({ userId, journalDate, content, projectId }) {
      const dayEntries = [...entries.values()].filter((entry) => entry.userId === userId && entry.journalDayId === `${userId}:${journalDate}`);
      const entry = {
        id: `entry-${nextId++}`,
        userId,
        journalDayId: `${userId}:${journalDate}`,
        projectId,
        content,
        origin: "manual" as const,
        displayOrder: (dayEntries.length ? Math.min(...dayEntries.map((candidate) => candidate.displayOrder)) : 0) - 1,
        createdAt: `2026-09-05T00:00:0${nextId}.000Z`,
        updatedAt: "updated",
      };
      entries.set(entry.id, entry);
      return entry;
    },
    async updateEntry({ userId, entryId, content, projectId }) {
      const entry = entries.get(entryId);
      if (!entry || entry.userId !== userId) throw new Error("journal entry not found");
      const updated = { ...entry, content, projectId, updatedAt: "changed" };
      entries.set(entryId, updated);
      return updated;
    },
    async deleteEntry({ userId, entryId }) {
      const entry = entries.get(entryId);
      if (!entry || entry.userId !== userId) throw new Error("journal entry not found");
      entries.delete(entryId);
    },
    async reorderEntries({ userId, journalDayId, entryIds }) {
      const dayEntries = [...entries.values()].filter((entry) => entry.userId === userId && entry.journalDayId === journalDayId);
      if (dayEntries.length !== entryIds.length || new Set(entryIds).size !== entryIds.length || entryIds.some((id) => !dayEntries.some((entry) => entry.id === id))) {
        throw new Error("reorder must include each journal entry exactly once");
      }
      entryIds.forEach((entryId, displayOrder) => {
        const entry = entries.get(entryId);
        if (entry) entries.set(entryId, { ...entry, displayOrder });
      });
      return [...entries.values()].filter((entry) => entry.userId === userId && entry.journalDayId === journalDayId).sort((a, b) => a.displayOrder - b.displayOrder);
    },
  };

  return { entries, manager: createJournalEntryManager(repository, () => new Date("2026-09-05T10:00:00.000Z")) };
}

describe("saved journal entries", () => {
  it("creates Uncategorized entries newest first, edits in place, and reorders deterministically", async () => {
    const memory = createMemoryEntries();
    const first = await memory.manager.createManualEntry("user-a", "2026-09-05", "UTC", "First work", null);
    const second = await memory.manager.createManualEntry("user-a", "2026-09-05", "UTC", "Second work", "project-1");

    expect((await memory.manager.listEntries("user-a", "user-a:2026-09-05")).map((entry) => entry.id)).toEqual([second.id, first.id]);
    const updated = await memory.manager.updateEntry("user-a", first.id, "Corrected work", "project-2");
    expect(updated).toMatchObject({ id: first.id, content: "Corrected work", projectId: "project-2" });
    await memory.manager.reorderEntries("user-a", first.journalDayId, [first.id, second.id]);
    expect((await memory.manager.listEntries("user-a", first.journalDayId)).map((entry) => entry.id)).toEqual([first.id, second.id]);
    expect(memory.entries.get(first.id)?.id).toBe(first.id);
  });

  it("protects entry privacy and requires confirmation before deletion", async () => {
    const memory = createMemoryEntries();
    const entry = await memory.manager.createManualEntry("user-a", "2026-09-05", "UTC", "Private work", null);

    await expect(memory.manager.listEntries("user-b", entry.journalDayId)).resolves.toEqual([]);
    await expect(memory.manager.updateEntry("user-b", entry.id, "stolen", null)).rejects.toThrow("not found");
    await expect(memory.manager.deleteEntry("user-a", entry.id, "no")).rejects.toThrow("Type DELETE");
    await memory.manager.deleteEntry("user-a", entry.id, ENTRY_DELETE_CONFIRMATION);
    expect(memory.entries.has(entry.id)).toBe(false);
  });

  it("rejects future dates before touching persistence", async () => {
    const memory = createMemoryEntries();
    await expect(memory.manager.createManualEntry("user-a", "2026-09-06", "UTC", "Future", null)).rejects.toThrow("Future dates");
    expect(memory.entries.size).toBe(0);
  });
});
