import { getAuthenticatedUser } from "@/lib/auth/server";
import { createProjectManager } from "@/lib/journal/projects";
import { getSupabaseProjectRepository } from "@/lib/supabase/projects";

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "The project could not be changed.";
  const safeMessage = message.includes("active project name already exists")
    ? "An active project with that name already exists."
    : message;
  return Response.json({ error: safeMessage }, { status: 400 });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  try {
    const projects = await createProjectManager(await getSupabaseProjectRepository()).listProjects(user.id);
    return Response.json({ projects });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json() as { name?: unknown };
    const project = await createProjectManager(await getSupabaseProjectRepository()).createProject(
      user.id,
      typeof body.name === "string" ? body.name : "",
    );
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}
