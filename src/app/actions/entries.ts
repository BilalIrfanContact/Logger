"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import {
  createJournalEntryManager,
  ENTRY_DELETE_CONFIRMATION,
} from "@/lib/journal/entries";
import { getAccountPreferences } from "@/lib/supabase/account";
import { getSupabaseJournalEntryRepository } from "@/lib/supabase/entries";

export type EntryActionResult = {
  error?: string;
  entryId?: string;
};

function isRedirect(error: unknown): boolean {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}

function publicEntryError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("project not found or is archived")) {
    return "Choose an active project or Uncategorized.";
  }
  if (message) return message;
  return "The journal entry could not be changed. Please try again.";
}

async function withEntryManager() {
  return createJournalEntryManager(await getSupabaseJournalEntryRepository());
}

export async function createManualEntryAction(
  journalDate: string,
  content: string,
  projectId: string | null,
): Promise<EntryActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    const preferences = await getAccountPreferences(user.id);
    const entry = await (await withEntryManager()).createManualEntry(
      user.id,
      journalDate,
      preferences.timezone,
      content,
      projectId,
    );
    revalidatePath("/app");
    return { entryId: entry.id };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicEntryError(error) };
  }
}

export async function updateJournalEntryAction(
  entryId: string,
  content: string,
  projectId: string | null,
): Promise<EntryActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withEntryManager()).updateEntry(user.id, entryId, content, projectId);
    revalidatePath("/app");
    return { entryId };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicEntryError(error) };
  }
}

export async function deleteJournalEntryAction(
  entryId: string,
  confirmation: string,
): Promise<EntryActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withEntryManager()).deleteEntry(user.id, entryId, confirmation);
    revalidatePath("/app");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicEntryError(error) };
  }
}

export async function reorderJournalEntriesAction(
  journalDayId: string,
  entryIds: string[],
): Promise<EntryActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withEntryManager()).reorderEntries(user.id, journalDayId, entryIds);
    revalidatePath("/app");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicEntryError(error) };
  }
}

export { ENTRY_DELETE_CONFIRMATION };
