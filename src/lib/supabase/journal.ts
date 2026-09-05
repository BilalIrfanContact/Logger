import type { SupabaseClient } from "@supabase/supabase-js";

import type { CalendarDate } from "@/lib/journal/date";
import type { JournalCapture, JournalDay, RawNote } from "@/lib/journal/capture";

import { createSupabaseServerClient } from "./server";

type JournalClient = Pick<SupabaseClient, "from" | "rpc">;

type JournalDayRow = {
  id: string;
  user_id: string;
  journal_date: CalendarDate;
  timezone: string;
  midnight_at: string;
  due_at: string;
  current_revision_id: string | null;
  created_at: string;
  updated_at: string;
};

type RawNoteRow = {
  id: string;
  user_id: string;
  journal_day_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function mapJournalDay(row: JournalDayRow): JournalDay {
  return {
    id: row.id,
    userId: row.user_id,
    journalDate: row.journal_date,
    timezone: row.timezone,
    midnightAt: row.midnight_at,
    dueAt: row.due_at,
    currentRevisionId: row.current_revision_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRawNote(row: RawNoteRow): RawNote {
  return {
    id: row.id,
    userId: row.user_id,
    journalDayId: row.journal_day_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createSupabaseJournalCapture(
  client: JournalClient,
): JournalCapture {
  return {
    async getOrCreateJournalDay({ userId, journalDate, timezone }) {
      const { data, error } = await client.rpc("get_or_create_journal_day", {
        p_journal_date: journalDate,
        p_timezone: timezone,
      });
      if (error) throw error;
      if (!data) throw new Error("Journal day could not be opened.");
      const day = mapJournalDay(data as JournalDayRow);
      if (day.userId !== userId) throw new Error("Journal day ownership check failed.");
      return day;
    },

    async getJournalDay({ userId, journalDate }) {
      const { data: dayData, error: dayError } = await client
        .from("journal_days")
        .select("id, user_id, journal_date, timezone, midnight_at, due_at, current_revision_id, created_at, updated_at")
        .eq("user_id", userId)
        .eq("journal_date", journalDate)
        .maybeSingle();
      if (dayError) throw dayError;
      if (!dayData) return null;

      const day = mapJournalDay(dayData as JournalDayRow);
      const { data: notesData, error: notesError } = await client
        .from("raw_notes")
        .select("id, user_id, journal_day_id, content, created_at, updated_at")
        .eq("user_id", userId)
        .eq("journal_day_id", day.id)
        .order("created_at", { ascending: false });
      if (notesError) throw notesError;

      return { day, notes: (notesData as RawNoteRow[]).map(mapRawNote) };
    },

    async saveRawNote({ journalDate, timezone, noteId, content }) {
      const { data, error } = await client.rpc("save_raw_note", {
        p_journal_date: journalDate,
        p_timezone: timezone,
        p_note_id: noteId,
        p_content: content,
      });
      if (error) throw error;
      if (!data) throw new Error("Raw note could not be saved.");
      return mapRawNote(data as RawNoteRow);
    },

    async deleteRawNote({ noteId }) {
      const { error } = await client.rpc("delete_raw_note", { p_note_id: noteId });
      if (error) throw error;
    },
  };
}

export async function getSupabaseJournalCapture(): Promise<JournalCapture> {
  return createSupabaseJournalCapture(await createSupabaseServerClient());
}
