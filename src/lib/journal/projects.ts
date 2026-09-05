export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  userId: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectRepository = {
  listProjects: (input: { userId: string }) => Promise<Project[]>;
  createProject: (input: { userId: string; name: string }) => Promise<Project>;
  renameProject: (input: { userId: string; projectId: string; name: string }) => Promise<Project>;
  archiveProject: (input: { userId: string; projectId: string }) => Promise<void>;
  restoreProject: (input: { userId: string; projectId: string }) => Promise<void>;
  mergeProjects: (input: {
    userId: string;
    sourceProjectId: string;
    targetProjectId: string;
    confirmation: string;
  }) => Promise<void>;
  deleteProject: (input: {
    userId: string;
    projectId: string;
    confirmation: string;
  }) => Promise<void>;
};

export const PROJECT_MERGE_CONFIRMATION = "MERGE";

export function normalizeProjectName(name: string): string {
  return name.trim().replace(/\s+/gu, " ");
}

function assertProjectName(name: string): string {
  const normalized = normalizeProjectName(name);
  if (!normalized) {
    throw new Error("A project needs a name before it can be saved.");
  }
  if (normalized.length > 120) {
    throw new Error("Project names cannot exceed 120 characters.");
  }
  return normalized;
}

function assertId(value: string, message: string): string {
  if (!value.trim()) throw new Error(message);
  return value;
}

export function createProjectManager(repository: ProjectRepository) {
  return {
    async listProjects(userId: string) {
      return repository.listProjects({ userId });
    },

    async createProject(userId: string, name: string) {
      return repository.createProject({ userId, name: assertProjectName(name) });
    },

    async renameProject(userId: string, projectId: string, name: string) {
      return repository.renameProject({
        userId,
        projectId: assertId(projectId, "A project is required."),
        name: assertProjectName(name),
      });
    },

    async archiveProject(userId: string, projectId: string) {
      return repository.archiveProject({
        userId,
        projectId: assertId(projectId, "A project is required."),
      });
    },

    async restoreProject(userId: string, projectId: string) {
      return repository.restoreProject({
        userId,
        projectId: assertId(projectId, "A project is required."),
      });
    },

    async mergeProjects(
      userId: string,
      sourceProjectId: string,
      targetProjectId: string,
      confirmation: string,
    ) {
      if (confirmation !== PROJECT_MERGE_CONFIRMATION) {
        throw new Error("Type MERGE to confirm this project merge.");
      }
      return repository.mergeProjects({
        userId,
        sourceProjectId: assertId(sourceProjectId, "A source project is required."),
        targetProjectId: assertId(targetProjectId, "A target project is required."),
        confirmation,
      });
    },

    async deleteProject(userId: string, projectId: string, confirmation: string) {
      if (!confirmation.trim()) {
        throw new Error("Type the project name to confirm deletion.");
      }
      return repository.deleteProject({
        userId,
        projectId: assertId(projectId, "A project is required."),
        confirmation,
      });
    },
  };
}
