"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteRawNoteAction, saveRawNoteAction } from "@/app/actions/journal";
import type { RawNote } from "@/lib/journal/capture";
import { formatNoteTime } from "@/lib/journal/date";

function NoteEditor({
  date,
  locale,
  timezone,
  note,
}: {
  date: string;
  locale: string;
  timezone: string;
  note: RawNote;
}) {
  const router = useRouter();
  const [content, setContent] = useState(note.content);
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (content === note.content) return;
    setStatus("saving");
    const timeout = window.setTimeout(async () => {
      const result = await saveRawNoteAction(date, note.id, content);
      if (result.error) {
        setStatus("error");
        setError(result.error);
        return;
      }
      setStatus("saved");
      setError(null);
      router.refresh();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [content, date, note.content, note.id, router]);

  async function deleteNote() {
    setDeleting(true);
    const result = await deleteRawNoteAction(note.id);
    if (result.error) {
      setError(result.error);
      setStatus("error");
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <article className="raw-note" data-note-id={note.id}>
      <div className="raw-note-meta">
        <time dateTime={note.createdAt}>{formatNoteTime(note.createdAt, locale, timezone)}</time>
        <span>{status === "saving" ? "Saving…" : status === "error" ? "Could not save" : "Saved"}</span>
      </div>
      <textarea
        aria-label={`Raw note from ${formatNoteTime(note.createdAt, locale, timezone)}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
      />
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      <button className="text-button note-delete" type="button" onClick={deleteNote} disabled={deleting}>
        {deleting ? "Deleting…" : "Delete note"}
      </button>
    </article>
  );
}

function NewNoteEditor({ date }: { date: string }) {
  const router = useRouter();
  const noteId = useRef<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!content.trim()) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    const timeout = window.setTimeout(async () => {
      const result = await saveRawNoteAction(date, noteId.current, content);
      if (result.error) {
        setStatus("error");
        setError(result.error);
        return;
      }
      noteId.current = result.noteId ?? noteId.current;
      setStatus("saved");
      setError(null);
      router.refresh();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [content, date, router]);

  return (
    <div className="new-note">
      <div className="raw-note-meta">
        <span>Add a raw note</span>
        <span>{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Could not save" : "Autosaves"}</span>
      </div>
      <textarea
        aria-label="Add a raw note"
        placeholder="What happened?"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
      />
      {error && <p className="form-message form-error" role="alert">{error}</p>}
    </div>
  );
}

export function JournalDayCapture({
  date,
  locale,
  timezone,
  notes,
}: {
  date: string;
  locale: string;
  timezone: string;
  notes: RawNote[];
}) {
  return (
    <div className="journal-capture">
      <div className="notes-list" aria-live="polite">
        {notes.length === 0 && <p className="empty-notes">No raw notes yet. This journal day is ready when you are.</p>}
        {notes.map((note) => (
          <NoteEditor key={note.id} date={date} locale={locale} timezone={timezone} note={note} />
        ))}
      </div>
      <NewNoteEditor date={date} />
    </div>
  );
}
