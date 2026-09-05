"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { createJournalCapture } from "@/lib/journal/capture";
import { getAccountPreferences } from "@/lib/supabase/account";
import { getSupabaseJournalCapture } from "@/lib/supabase/journal";

export type JournalActionResult = {
  error?: string;
  noteId?: string;
};

function publicJournalError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Your note could not be saved. Please try again.";
}

export async function saveRawNoteAction(
  journalDate: string,
  noteId: string | null,
  content: string,
): Promise<JournalActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    const preferences = await getAccountPreferences(user.id);
    const capture = createJournalCapture(await getSupabaseJournalCapture());
    const note = await capture.saveRawNote(user.id, journalDate, preferences, noteId, content);
    revalidatePath("/app");
    return { noteId: note.id };
  } catch (error) {
    return { error: publicJournalError(error) };
  }
}

export async function deleteRawNoteAction(
  noteId: string,
): Promise<JournalActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    const capture = createJournalCapture(await getSupabaseJournalCapture());
    await capture.deleteRawNote(user.id, noteId);
    revalidatePath("/app");
    return {};
  } catch (error) {
    return { error: publicJournalError(error) };
  }
}
