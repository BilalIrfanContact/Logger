import { getAuthenticatedUser } from "@/lib/auth/server";
import { createJournalEntryManager } from "@/lib/journal/entries";
import { getSupabaseJournalEntryRepository } from "@/lib/supabase/entries";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json() as { journalDayId?: unknown; entryIds?: unknown };
    const entries = await createJournalEntryManager(await getSupabaseJournalEntryRepository()).reorderEntries(
      user.id,
      typeof body.journalDayId === "string" ? body.journalDayId : "",
      Array.isArray(body.entryIds) && body.entryIds.every((id): id is string => typeof id === "string") ? body.entryIds : [],
    );
    return Response.json({ entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Entries could not be reordered.";
    return Response.json({ error: message }, { status: 400 });
  }
}
