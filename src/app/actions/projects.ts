"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { createProjectManager } from "@/lib/journal/projects";
import { getSupabaseProjectRepository } from "@/lib/supabase/projects";

export type ProjectActionResult = {
  error?: string;
  projectId?: string;
};

function isRedirect(error: unknown): boolean {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}

function publicProjectError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("active project name already exists")) {
    return "An active project with that name already exists.";
  }
  if (message) return message;
  return "The project could not be changed. Please try again.";
}

async function withProjectManager() {
  return createProjectManager(await getSupabaseProjectRepository());
}

export async function createProjectAction(name: string): Promise<ProjectActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    const project = await (await withProjectManager()).createProject(user.id, name);
    revalidatePath("/app");
    revalidatePath("/app/projects");
    return { projectId: project.id };
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicProjectError(error) };
  }
}

export async function renameProjectAction(
  projectId: string,
  name: string,
): Promise<ProjectActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withProjectManager()).renameProject(user.id, projectId, name);
    revalidatePath("/app");
    revalidatePath("/app/projects");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicProjectError(error) };
  }
}

export async function archiveProjectAction(projectId: string): Promise<ProjectActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withProjectManager()).archiveProject(user.id, projectId);
    revalidatePath("/app");
    revalidatePath("/app/projects");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicProjectError(error) };
  }
}

export async function restoreProjectAction(projectId: string): Promise<ProjectActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withProjectManager()).restoreProject(user.id, projectId);
    revalidatePath("/app");
    revalidatePath("/app/projects");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicProjectError(error) };
  }
}

export async function mergeProjectsAction(
  sourceProjectId: string,
  targetProjectId: string,
  confirmation: string,
): Promise<ProjectActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withProjectManager()).mergeProjects(
      user.id,
      sourceProjectId,
      targetProjectId,
      confirmation,
    );
    revalidatePath("/app");
    revalidatePath("/app/projects");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicProjectError(error) };
  }
}

export async function deleteProjectAction(
  projectId: string,
  confirmation: string,
): Promise<ProjectActionResult> {
  try {
    const user = await requireAuthenticatedUser();
    await (await withProjectManager()).deleteProject(user.id, projectId, confirmation);
    revalidatePath("/app");
    revalidatePath("/app/projects");
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: publicProjectError(error) };
  }
}
