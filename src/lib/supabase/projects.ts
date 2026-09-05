import type { SupabaseClient } from "@supabase/supabase-js";

import type { Project, ProjectRepository, ProjectStatus } from "@/lib/journal/projects";

import { createSupabaseServerClient } from "./server";

type ProjectClient = Pick<SupabaseClient, "from" | "rpc">;

type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const projectSelect = "id, user_id, name, status, created_at, updated_at";

export function createSupabaseProjectRepository(client: ProjectClient): ProjectRepository {
  return {
    async listProjects({ userId }) {
      const { data, error } = await client
        .from("projects")
        .select(projectSelect)
        .eq("user_id", userId)
        .order("status", { ascending: true })
        .order("name_normalized", { ascending: true });
      if (error) throw error;
      return (data as ProjectRow[]).map(mapProject);
    },

    async createProject({ name }) {
      const { data, error } = await client.rpc("create_project", { p_name: name });
      if (error) throw error;
      if (!data) throw new Error("Project could not be created.");
      return mapProject(data as ProjectRow);
    },

    async renameProject({ projectId, name }) {
      const { data, error } = await client.rpc("rename_project", {
        p_project_id: projectId,
        p_name: name,
      });
      if (error) throw error;
      if (!data) throw new Error("Project could not be renamed.");
      return mapProject(data as ProjectRow);
    },

    async archiveProject({ projectId }) {
      const { error } = await client.rpc("archive_project", { p_project_id: projectId });
      if (error) throw error;
    },

    async restoreProject({ projectId }) {
      const { error } = await client.rpc("restore_project", { p_project_id: projectId });
      if (error) throw error;
    },

    async mergeProjects({ sourceProjectId, targetProjectId, confirmation }) {
      const { error } = await client.rpc("merge_projects", {
        p_source_project_id: sourceProjectId,
        p_target_project_id: targetProjectId,
        p_confirmation: confirmation,
      });
      if (error) throw error;
    },

    async deleteProject({ projectId, confirmation }) {
      const { error } = await client.rpc("delete_project", {
        p_project_id: projectId,
        p_confirmation: confirmation,
      });
      if (error) throw error;
    },
  };
}

export async function getSupabaseProjectRepository(): Promise<ProjectRepository> {
  return createSupabaseProjectRepository(await createSupabaseServerClient());
}
