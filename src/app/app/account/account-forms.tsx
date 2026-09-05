"use client";

import { useActionState } from "react";

import { deleteAccountAction, updatePreferencesAction, type AccountActionState } from "@/app/actions/account";
import type { AccountPreferences } from "@/lib/account/preferences";

const initialState: AccountActionState = {};

export function PreferencesForm({ preferences }: { preferences: AccountPreferences }) {
  const [state, formAction, pending] = useActionState(updatePreferencesAction, initialState);

  return (
    <form className="settings-form" action={formAction}>
      <div>
        <p className="panel-label">Display preferences</p>
        <h2>Make dates feel familiar</h2>
        <p className="settings-copy">These saved preferences control future journal display and journal-day boundaries.</p>
      </div>
      <label className="field">
        <span>Locale</span>
        <input name="locale" defaultValue={preferences.locale} placeholder="en-US" required />
      </label>
      <label className="field">
        <span>Timezone</span>
        <input name="timezone" defaultValue={preferences.timezone} placeholder="Asia/Karachi" required />
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save preferences"}</button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);

  return (
    <form className="danger-zone" action={formAction}>
      <p className="panel-label">Permanent action</p>
      <h2>Delete your account</h2>
      <p>This permanently removes your Kept account and all private journal data. This cannot be undone.</p>
      <label className="field">
        <span>Type DELETE to confirm</span>
        <input name="confirmation" autoComplete="off" required />
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      <button className="button button-danger" type="submit" disabled={pending}>{pending ? "Deleting…" : "Delete account permanently"}</button>
    </form>
  );
}
