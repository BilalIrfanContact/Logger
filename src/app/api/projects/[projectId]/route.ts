import { getAuthenticatedUser } from "@/lib/auth/server";
import { createProjectManager } from "@/lib/journal/projects";
import { getSupabaseProjectRepository } from "@/lib/supabase/projects";

type RouteContext = { params: Promise<{ projectId: string }> };

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "The project could not be changed.";
  const safeMessage = message.includes("active project name already exists")
    ? "An active project with that name already exists."
    : message;
  return Response.json({ error: safeMessage }, { status: 400 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { projectId } = await context.params;

  try {
    const body = await request.json() as { action?: unknown; name?: unknown; targetProjectId?: unknown; confirmation?: unknown };
    const manager = createProjectManager(await getSupabaseProjectRepository());
    if (body.action === "rename") {
      await manager.renameProject(user.id, projectId, typeof body.name === "string" ? body.name : "");
    } else if (body.action === "archive") {
      await manager.archiveProject(user.id, projectId);
    } else if (body.action === "restore") {
      await manager.restoreProject(user.id, projectId);
    } else if (body.action === "merge") {
      await manager.mergeProjects(user.id, projectId, typeof body.targetProjectId === "string" ? body.targetProjectId : "", typeof body.confirmation === "string" ? body.confirmation : "");
    } else {
      return Response.json({ error: "Choose a project action." }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { projectId } = await context.params;

  try {
    const body = await request.json() as { confirmation?: unknown };
    await createProjectManager(await getSupabaseProjectRepository()).deleteProject(
      user.id,
      projectId,
      typeof body.confirmation === "string" ? body.confirmation : "",
    );
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
