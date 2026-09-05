import { getAuthenticatedUser } from "@/lib/auth/server";
import { createJournalEntryManager } from "@/lib/journal/entries";
import { getAccountPreferences } from "@/lib/supabase/account";
import { getSupabaseJournalEntryRepository } from "@/lib/supabase/entries";

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "The journal entry could not be changed.";
  const safeMessage = message.includes("project not found or is archived")
    ? "Choose an active project or Uncategorized."
    : message;
  return Response.json({ error: safeMessage }, { status: 400 });
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const journalDayId = new URL(request.url).searchParams.get("journalDayId") ?? "";

  try {
    const entries = await createJournalEntryManager(await getSupabaseJournalEntryRepository()).listEntries(user.id, journalDayId);
    return Response.json({ entries });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json() as { journalDate?: unknown; content?: unknown; projectId?: unknown };
    const preferences = await getAccountPreferences(user.id);
    const entry = await createJournalEntryManager(await getSupabaseJournalEntryRepository()).createManualEntry(
      user.id,
      typeof body.journalDate === "string" ? body.journalDate : "",
      preferences.timezone,
      typeof body.content === "string" ? body.content : "",
      typeof body.projectId === "string" ? body.projectId : null,
    );
    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}
