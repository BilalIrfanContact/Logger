"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  archiveProjectAction,
  createProjectAction,
  deleteProjectAction,
  mergeProjectsAction,
  renameProjectAction,
  restoreProjectAction,
  type ProjectActionResult,
} from "@/app/actions/projects";
import { PROJECT_MERGE_CONFIRMATION, type Project } from "@/lib/journal/projects";

function projectError(result: ProjectActionResult): string | null {
  return result.error ?? null;
}

export function ProjectManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sourceProjectId, setSourceProjectId] = useState(projects[0]?.id ?? "");
  const [targetProjectId, setTargetProjectId] = useState(projects[1]?.id ?? projects[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSourceProjectId((current) => projects.some((project) => project.id === current) ? current : projects[0]?.id ?? "");
    setTargetProjectId((current) => projects.some((project) => project.id === current) ? current : projects[1]?.id ?? projects[0]?.id ?? "");
  }, [projects]);

  async function run(action: () => Promise<ProjectActionResult>) {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    const actionError = projectError(result);
    if (actionError) {
      setError(actionError);
      return false;
    }
    router.refresh();
    return true;
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run(() => createProjectAction(name))) setName("");
  }

  async function renameProject(project: Project, nextName: string) {
    await run(() => renameProjectAction(project.id, nextName));
  }

  async function deleteProject(project: Project) {
    const confirmation = window.prompt(
      `Type the project name exactly to permanently delete "${project.name}". Its entries will also be deleted.`,
    );
    if (confirmation === null) return;
    await run(() => deleteProjectAction(project.id, confirmation));
  }

  async function mergeProjects(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceProjectId || !targetProjectId || sourceProjectId === targetProjectId) {
      setError("Choose two different projects to merge.");
      return;
    }
    const source = projects.find((project) => project.id === sourceProjectId);
    const target = projects.find((project) => project.id === targetProjectId);
    if (!source || !target) return;
    if (!window.confirm(`Move all entries from "${source.name}" into "${target.name}" and delete the source project?`)) {
      return;
    }
    await run(() => mergeProjectsAction(source.id, target.id, PROJECT_MERGE_CONFIRMATION));
  }

  const activeProjects = projects.filter((project) => project.status === "active");
  const archivedProjects = projects.filter((project) => project.status === "archived");

  return (
    <div className="project-manager">
      <div className="project-create-panel">
        <p className="panel-label">New project</p>
        <h2>Keep related work together</h2>
        <form className="project-create-form" onSubmit={createProject}>
          <label className="field">
            <span>Project name</span>
            <input
              aria-label="Project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Kept V1"
              maxLength={120}
              required
            />
          </label>
          <button className="button button-primary" type="submit" disabled={busy}>Create project</button>
        </form>
      </div>

      {error && <p className="form-message form-error" role="alert">{error}</p>}

      <section className="project-list" aria-labelledby="active-projects-title">
        <div className="section-heading">
          <div>
            <p className="panel-label">Active projects</p>
            <h2 id="active-projects-title">Your current work</h2>
          </div>
          <span className="item-count">{activeProjects.length}</span>
        </div>
        {activeProjects.length === 0 ? (
          <p className="empty-notes">No active projects yet. Entries can stay Uncategorized.</p>
        ) : (
          <div className="projects-grid">
            {activeProjects.map((project) => <ProjectRow key={project.id} project={project} busy={busy} onRename={renameProject} onArchive={(id) => run(() => archiveProjectAction(id))} onDelete={deleteProject} />)}
          </div>
        )}
      </section>

      <section className="project-list" aria-labelledby="archived-projects-title">
        <div className="section-heading">
          <div>
            <p className="panel-label">Archived projects</p>
            <h2 id="archived-projects-title">Kept for history</h2>
          </div>
          <span className="item-count">{archivedProjects.length}</span>
        </div>
        {archivedProjects.length === 0 ? (
          <p className="empty-notes">Archived projects will stay here with their saved history.</p>
        ) : (
          <div className="projects-grid">
            {archivedProjects.map((project) => <ProjectRow key={project.id} project={project} busy={busy} onRename={renameProject} onRestore={(id) => run(() => restoreProjectAction(id))} onDelete={deleteProject} />)}
          </div>
        )}
      </section>

      {projects.length > 1 && (
        <section className="project-merge-panel" aria-labelledby="merge-projects-title">
          <p className="panel-label">Explicit merge</p>
          <h2 id="merge-projects-title">Combine duplicate projects</h2>
          <p className="settings-copy">Entries move to the target project. The source project is then removed.</p>
          <form className="merge-form" onSubmit={mergeProjects}>
            <label className="field"><span>Move from</span><select value={sourceProjectId} onChange={(event) => setSourceProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name} ({project.status})</option>)}</select></label>
            <label className="field"><span>Move to</span><select value={targetProjectId} onChange={(event) => setTargetProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name} ({project.status})</option>)}</select></label>
            <button className="button button-secondary" type="submit" disabled={busy}>Merge projects</button>
          </form>
        </section>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  busy,
  onRename,
  onArchive,
  onRestore,
  onDelete,
}: {
  project: Project;
  busy: boolean;
  onRename: (project: Project, name: string) => Promise<void>;
  onArchive?: (id: string) => Promise<boolean>;
  onRestore?: (id: string) => Promise<boolean>;
  onDelete: (project: Project) => Promise<void>;
}) {
  const [name, setName] = useState(project.name);

  return (
    <article className="project-row">
      <form onSubmit={(event) => { event.preventDefault(); void onRename(project, name); }}>
        <label className="field"><span>Project name</span><input aria-label={`Rename ${project.name}`} value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></label>
        <button className="text-button" type="submit" disabled={busy}>Rename</button>
      </form>
      <div className="project-actions">
        {onArchive && <button className="text-button" type="button" onClick={() => void onArchive(project.id)} disabled={busy}>Archive</button>}
        {onRestore && <button className="text-button" type="button" onClick={() => void onRestore(project.id)} disabled={busy}>Restore</button>}
        <button className="text-button project-delete" type="button" onClick={() => void onDelete(project)} disabled={busy}>Delete permanently</button>
      </div>
    </article>
  );
}
