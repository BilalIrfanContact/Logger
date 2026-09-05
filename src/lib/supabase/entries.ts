import type { SupabaseClient } from "@supabase/supabase-js";

import type { CalendarDate } from "@/lib/journal/date";
import type {
  JournalEntry,
  JournalEntryOrigin,
  JournalEntryRepository,
} from "@/lib/journal/entries";

import { createSupabaseServerClient } from "./server";

type EntryClient = Pick<SupabaseClient, "from" | "rpc">;

type JournalEntryRow = {
  id: string;
  user_id: string;
  journal_day_id: string;
  project_id: string | null;
  content: string;
  origin: JournalEntryOrigin;
  display_order: number;
  created_at: string;
  updated_at: string;
};

function mapEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    journalDayId: row.journal_day_id,
    projectId: row.project_id,
    content: row.content,
    origin: row.origin,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const entrySelect = "id, user_id, journal_day_id, project_id, content, origin, display_order, created_at, updated_at";

export function createSupabaseJournalEntryRepository(client: EntryClient): JournalEntryRepository {
  return {
    async listEntries({ userId, journalDayId }) {
      const { data, error } = await client
        .from("journal_entries")
        .select(entrySelect)
        .eq("user_id", userId)
        .eq("journal_day_id", journalDayId)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });
      if (error) throw error;
      return (data as JournalEntryRow[]).map(mapEntry);
    },

    async createManualEntry({ journalDate, timezone, content, projectId }) {
      const { data, error } = await client.rpc("create_manual_journal_entry", {
        p_journal_date: journalDate,
        p_timezone: timezone,
        p_content: content,
        p_project_id: projectId,
      });
      if (error) throw error;
      if (!data) throw new Error("Journal entry could not be created.");
      return mapEntry(data as JournalEntryRow);
    },

    async updateEntry({ entryId, content, projectId }) {
      const { data, error } = await client.rpc("update_journal_entry", {
        p_entry_id: entryId,
        p_content: content,
        p_project_id: projectId,
      });
      if (error) throw error;
      if (!data) throw new Error("Journal entry could not be updated.");
      return mapEntry(data as JournalEntryRow);
    },

    async deleteEntry({ entryId }) {
      const { error } = await client.rpc("delete_journal_entry", {
        p_entry_id: entryId,
        p_confirmation: "DELETE",
      });
      if (error) throw error;
    },

    async reorderEntries({ journalDayId, entryIds }) {
      const { data, error } = await client.rpc("reorder_journal_entries", {
        p_journal_day_id: journalDayId,
        p_entry_ids: entryIds,
      });
      if (error) throw error;
      return ((data ?? []) as JournalEntryRow[]).map(mapEntry);
    },
  };
}

export async function getSupabaseJournalEntryRepository(): Promise<JournalEntryRepository> {
  return createSupabaseJournalEntryRepository(await createSupabaseServerClient());
}
