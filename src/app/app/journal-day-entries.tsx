"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createManualEntryAction,
  deleteJournalEntryAction,
  ENTRY_DELETE_CONFIRMATION,
  reorderJournalEntriesAction,
  updateJournalEntryAction,
} from "@/app/actions/entries";
import type { JournalEntry } from "@/lib/journal/entries";
import type { Project } from "@/lib/journal/projects";
import { formatNoteTime } from "@/lib/journal/date";

export function JournalDayEntries({
  date,
  journalDayId,
  locale,
  timezone,
  entries,
  projects,
}: {
  date: string;
  journalDayId: string;
  locale: string;
  timezone: string;
  entries: JournalEntry[];
  projects: Project[];
}) {
  const router = useRouter();
  const [orderedEntries, setOrderedEntries] = useState(entries);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOrderedEntries(entries);
  }, [entries]);

  async function run(action: () => Promise<{ error?: string }>) {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.error) {
      setError(result.error);
      router.refresh();
      return false;
    }
    router.refresh();
    return true;
  }

  async function createEntry(content: string, projectId: string | null) {
    return run(() => createManualEntryAction(date, content, projectId));
  }

  async function moveEntry(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedEntries.length) return;
    const nextEntries = [...orderedEntries];
    [nextEntries[index], nextEntries[nextIndex]] = [nextEntries[nextIndex], nextEntries[index]];
    setOrderedEntries(nextEntries);
    if (!(await run(() => reorderJournalEntriesAction(journalDayId, nextEntries.map((entry) => entry.id))))) {
      setOrderedEntries(entries);
    }
  }

  return (
    <section className="saved-entry-section" aria-labelledby="saved-entries-title">
      <div className="section-heading">
        <div>
          <p className="panel-label">Saved journal entries</p>
          <h2 id="saved-entries-title">What you want to keep</h2>
        </div>
        <span className="item-count">{orderedEntries.length}</span>
      </div>
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      {orderedEntries.length === 0 ? (
        <p className="empty-notes">No saved entries yet. Add one below without running AI.</p>
      ) : (
        <div className="entries-list" aria-live="polite">
          {orderedEntries.map((entry, index) => (
            <EntryEditor
              key={entry.id}
              entry={entry}
              locale={locale}
              timezone={timezone}
              projects={projects}
              busy={busy}
              onSave={(content, projectId) => run(() => updateJournalEntryAction(entry.id, content, projectId))}
              onDelete={async () => {
                if (!window.confirm("Delete this saved journal entry?")) return;
                await run(() => deleteJournalEntryAction(entry.id, ENTRY_DELETE_CONFIRMATION));
              }}
              onMoveUp={() => void moveEntry(index, -1)}
              onMoveDown={() => void moveEntry(index, 1)}
              isFirst={index === 0}
              isLast={index === orderedEntries.length - 1}
            />
          ))}
        </div>
      )}
      <NewEntryForm projects={projects.filter((project) => project.status === "active")} busy={busy} onSave={createEntry} />
    </section>
  );
}

function projectOptions(projects: Project[], currentProjectId: string | null) {
  const current = projects.find((project) => project.id === currentProjectId);
  if (current && current.status === "archived") return [current, ...projects.filter((project) => project.id !== current.id)];
  return projects;
}

function ProjectSelect({ projects, value, onChange }: { projects: Project[]; value: string | null; onChange: (value: string | null) => void }) {
  return (
    <label className="field entry-project-field">
      <span>Project</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">Uncategorized</option>
        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}{project.status === "archived" ? " (archived)" : ""}</option>)}
      </select>
    </label>
  );
}

function NewEntryForm({ projects, busy, onSave }: { projects: Project[]; busy: boolean; onSave: (content: string, projectId: string | null) => Promise<boolean> }) {
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    if (await onSave(content, projectId)) {
      setContent("");
      setProjectId(null);
    }
  }

  return (
    <form className="new-entry-form" onSubmit={submit}>
      <div className="raw-note-meta"><span>Add saved entry</span><span>Manual</span></div>
      <textarea aria-label="Add a saved journal entry" placeholder="What do you want to remember?" value={content} onChange={(event) => setContent(event.target.value)} rows={4} maxLength={20000} required />
      <div className="entry-form-controls">
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <button className="button button-primary" type="submit" disabled={busy || !content.trim()}>Save entry</button>
      </div>
    </form>
  );
}

function EntryEditor({
  entry,
  locale,
  timezone,
  projects,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  entry: JournalEntry;
  locale: string;
  timezone: string;
  projects: Project[];
  busy: boolean;
  onSave: (content: string, projectId: string | null) => Promise<boolean>;
  onDelete: () => Promise<void>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [content, setContent] = useState(entry.content);
  const [projectId, setProjectId] = useState(entry.projectId);
  const [saved, setSaved] = useState(true);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onSave(content, projectId)) setSaved(true);
  }

  return (
    <article className="saved-entry" data-entry-id={entry.id}>
      <form onSubmit={save}>
        <div className="raw-note-meta">
          <time dateTime={entry.createdAt}>{formatNoteTime(entry.createdAt, locale, timezone)}</time>
          <span>{entry.origin === "manual" ? "Manual" : "Saved"}</span>
        </div>
        <textarea aria-label={`Saved entry from ${formatNoteTime(entry.createdAt, locale, timezone)}`} value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); }} rows={4} maxLength={20000} required />
        <div className="entry-controls">
          <ProjectSelect projects={projectOptions(projects, projectId)} value={projectId} onChange={(value) => { setProjectId(value); setSaved(false); }} />
          <div className="entry-actions">
            <button className="text-button" type="submit" disabled={busy || saved}>{saved ? "Saved" : "Save changes"}</button>
            <button className="text-button" type="button" onClick={onMoveUp} disabled={busy || isFirst} aria-label="Move entry earlier">Move up</button>
            <button className="text-button" type="button" onClick={onMoveDown} disabled={busy || isLast} aria-label="Move entry later">Move down</button>
            <button className="text-button entry-delete" type="button" onClick={() => void onDelete()} disabled={busy}>Delete</button>
          </div>
        </div>
      </form>
    </article>
  );
}
