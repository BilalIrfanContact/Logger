import {
  assertJournalDateIsAvailable,
  type CalendarDate,
} from "./date";

export type JournalEntryOrigin = "ai" | "manual";

export type JournalEntry = {
  id: string;
  userId: string;
  journalDayId: string;
  projectId: string | null;
  content: string;
  origin: JournalEntryOrigin;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type JournalEntryRepository = {
  listEntries: (input: { userId: string; journalDayId: string }) => Promise<JournalEntry[]>;
  createManualEntry: (input: {
    userId: string;
    journalDate: CalendarDate;
    timezone: string;
    content: string;
    projectId: string | null;
  }) => Promise<JournalEntry>;
  updateEntry: (input: {
    userId: string;
    entryId: string;
    content: string;
    projectId: string | null;
  }) => Promise<JournalEntry>;
  deleteEntry: (input: { userId: string; entryId: string }) => Promise<void>;
  reorderEntries: (input: {
    userId: string;
    journalDayId: string;
    entryIds: string[];
  }) => Promise<JournalEntry[]>;
};

export const ENTRY_DELETE_CONFIRMATION = "DELETE";

function assertEntryContent(content: string): string {
  const normalized = content.trim();
  if (!normalized) {
    throw new Error("A journal entry needs some text before it can be saved.");
  }
  if (normalized.length > 20_000) {
    throw new Error("Journal entries cannot exceed 20,000 characters.");
  }
  return normalized;
}

function assertProjectId(projectId: string | null): string | null {
  if (projectId === null || projectId === "") return null;
  if (!projectId.trim()) throw new Error("Choose a valid project or Uncategorized.");
  return projectId;
}

function assertId(value: string, message: string): string {
  if (!value.trim()) throw new Error(message);
  return value;
}

export function createJournalEntryManager(
  repository: JournalEntryRepository,
  clock: () => Date = () => new Date(),
) {
  return {
    async listEntries(userId: string, journalDayId: string) {
      return repository.listEntries({
        userId,
        journalDayId: assertId(journalDayId, "A journal day is required."),
      });
    },

    async createManualEntry(
      userId: string,
      journalDate: string,
      timezone: string,
      content: string,
      projectId: string | null,
    ) {
      assertJournalDateIsAvailable(journalDate, clock(), timezone);
      return repository.createManualEntry({
        userId,
        journalDate,
        timezone,
        content: assertEntryContent(content),
        projectId: assertProjectId(projectId),
      });
    },

    async updateEntry(
      userId: string,
      entryId: string,
      content: string,
      projectId: string | null,
    ) {
      return repository.updateEntry({
        userId,
        entryId: assertId(entryId, "A journal entry is required."),
        content: assertEntryContent(content),
        projectId: assertProjectId(projectId),
      });
    },

    async deleteEntry(userId: string, entryId: string, confirmation: string) {
      if (confirmation !== ENTRY_DELETE_CONFIRMATION) {
        throw new Error("Type DELETE to confirm entry deletion.");
      }
      return repository.deleteEntry({
        userId,
        entryId: assertId(entryId, "A journal entry is required."),
      });
    },

    async reorderEntries(userId: string, journalDayId: string, entryIds: string[]) {
      const dayId = assertId(journalDayId, "A journal day is required.");
      if (new Set(entryIds).size !== entryIds.length) {
        throw new Error("Each journal entry can appear only once in a reorder.");
      }
      if (entryIds.some((entryId) => !entryId.trim())) {
        throw new Error("A reorder contains an invalid journal entry.");
      }
      return repository.reorderEntries({ userId, journalDayId: dayId, entryIds });
    },
  };
}
