import { describe, expect, it } from "vitest";

import type { Project, ProjectRepository } from "./projects";
import { createProjectManager, normalizeProjectName, PROJECT_MERGE_CONFIRMATION } from "./projects";

function createMemoryProjects() {
  const projects = new Map<string, Project>();
  const entries = new Map<string, { userId: string; projectId: string | null }>();
  let nextId = 1;

  const repository: ProjectRepository = {
    async listProjects({ userId }) {
      return [...projects.values()].filter((project) => project.userId === userId);
    },
    async createProject({ userId, name }) {
      if ([...projects.values()].some((project) => project.userId === userId && project.status === "active" && project.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("active project name already exists");
      }
      const project = { id: `project-${nextId++}`, userId, name, status: "active" as const, createdAt: "created", updatedAt: "created" };
      projects.set(project.id, project);
      return project;
    },
    async renameProject({ userId, projectId, name }) {
      const project = projects.get(projectId);
      if (!project || project.userId !== userId) throw new Error("project not found");
      if ([...projects.values()].some((candidate) => candidate.id !== projectId && candidate.userId === userId && candidate.status === "active" && candidate.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("active project name already exists");
      }
      const renamed = { ...project, name };
      projects.set(projectId, renamed);
      return renamed;
    },
    async archiveProject({ userId, projectId }) {
      const project = projects.get(projectId);
      if (!project || project.userId !== userId) throw new Error("project not found");
      projects.set(projectId, { ...project, status: "archived" });
    },
    async restoreProject({ userId, projectId }) {
      const project = projects.get(projectId);
      if (!project || project.userId !== userId) throw new Error("project not found");
      if ([...projects.values()].some((candidate) => candidate.id !== projectId && candidate.userId === userId && candidate.status === "active" && candidate.name.toLowerCase() === project.name.toLowerCase())) {
        throw new Error("active project name already exists");
      }
      projects.set(projectId, { ...project, status: "active" });
    },
    async mergeProjects({ userId, sourceProjectId, targetProjectId }) {
      const source = projects.get(sourceProjectId);
      const target = projects.get(targetProjectId);
      if (!source || !target || source.userId !== userId || target.userId !== userId) throw new Error("project not found");
      for (const [entryId, entry] of entries) {
        if (entry.userId === userId && entry.projectId === sourceProjectId) entries.set(entryId, { ...entry, projectId: targetProjectId });
      }
      projects.delete(sourceProjectId);
    },
    async deleteProject({ userId, projectId, confirmation }) {
      const project = projects.get(projectId);
      if (!project || project.userId !== userId) throw new Error("project not found");
      if (confirmation !== project.name) throw new Error("type the project name to confirm deletion");
      projects.delete(projectId);
      for (const [entryId, entry] of entries) if (entry.userId === userId && entry.projectId === projectId) entries.delete(entryId);
    },
  };

  return { projects, entries, manager: createProjectManager(repository) };
}

describe("project management", () => {
  it("canonicalizes repeated whitespace and keeps names private", async () => {
    const memory = createMemoryProjects();
    expect(normalizeProjectName("  Kept   V1\n")).toBe("Kept V1");
    const created = await memory.manager.createProject("user-a", "  Kept   V1\n");

    await expect(memory.manager.createProject("user-a", "kept v1")).rejects.toThrow("already exists");
    await expect(memory.manager.listProjects("user-b")).resolves.toEqual([]);
    await expect(memory.manager.renameProject("user-b", created.id, "Private rename")).rejects.toThrow("project not found");
  });

  it("allows archived duplicates but blocks a conflicting restore", async () => {
    const memory = createMemoryProjects();
    const first = await memory.manager.createProject("user-a", "Build");
    await memory.manager.archiveProject("user-a", first.id);
    const second = await memory.manager.createProject("user-a", " build ");

    expect((await memory.manager.listProjects("user-a")).map((project) => project.status)).toEqual(["archived", "active"]);
    await expect(memory.manager.restoreProject("user-a", first.id)).rejects.toThrow("already exists");
    await memory.manager.renameProject("user-a", first.id, "Legacy build");
    await memory.manager.restoreProject("user-a", first.id);
    expect((await memory.manager.listProjects("user-a")).find((project) => project.id === first.id)?.status).toBe("active");
    expect(second.id).not.toBe(first.id);
  });

  it("renames without changing the project ID or entry relationships", async () => {
    const memory = createMemoryProjects();
    const project = await memory.manager.createProject("user-a", "Old name");
    memory.entries.set("entry-1", { userId: "user-a", projectId: project.id });

    await memory.manager.renameProject("user-a", project.id, "New name");
    expect((await memory.manager.listProjects("user-a"))[0]).toMatchObject({ id: project.id, name: "New name" });
    expect(memory.entries.get("entry-1")?.projectId).toBe(project.id);
  });

  it("merges explicitly and deletes a project with its related entries", async () => {
    const memory = createMemoryProjects();
    const source = await memory.manager.createProject("user-a", "Duplicate");
    await memory.manager.archiveProject("user-a", source.id);
    const target = await memory.manager.createProject("user-a", "Canonical");
    memory.entries.set("entry-1", { userId: "user-a", projectId: source.id });

    await expect(memory.manager.mergeProjects("user-a", source.id, target.id, "no")).rejects.toThrow("Type MERGE");
    await memory.manager.mergeProjects("user-a", source.id, target.id, PROJECT_MERGE_CONFIRMATION);
    expect(memory.projects.has(source.id)).toBe(false);
    expect(memory.entries.get("entry-1")?.projectId).toBe(target.id);

    await expect(memory.manager.deleteProject("user-a", target.id, "wrong")).rejects.toThrow("project name");
    await memory.manager.deleteProject("user-a", target.id, "Canonical");
    expect(memory.projects.has(target.id)).toBe(false);
    expect(memory.entries.has("entry-1")).toBe(false);
  });
});
