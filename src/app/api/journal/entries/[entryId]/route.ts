import { getAuthenticatedUser } from "@/lib/auth/server";
import { createJournalEntryManager } from "@/lib/journal/entries";
import { getSupabaseJournalEntryRepository } from "@/lib/supabase/entries";

type RouteContext = { params: Promise<{ entryId: string }> };

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "The journal entry could not be changed.";
  const safeMessage = message.includes("project not found or is archived")
    ? "Choose an active project or Uncategorized."
    : message;
  return Response.json({ error: safeMessage }, { status: 400 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { entryId } = await context.params;

  try {
    const body = await request.json() as { content?: unknown; projectId?: unknown };
    const entry = await createJournalEntryManager(await getSupabaseJournalEntryRepository()).updateEntry(
      user.id,
      entryId,
      typeof body.content === "string" ? body.content : "",
      typeof body.projectId === "string" ? body.projectId : null,
    );
    return Response.json({ entry });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { entryId } = await context.params;

  try {
    const body = await request.json() as { confirmation?: unknown };
    await createJournalEntryManager(await getSupabaseJournalEntryRepository()).deleteEntry(
      user.id,
      entryId,
      typeof body.confirmation === "string" ? body.confirmation : "",
    );
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
