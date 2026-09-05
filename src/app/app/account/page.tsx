import { getAccountPreferences } from "@/lib/supabase/account";
import { requireAuthenticatedUser } from "@/lib/auth/server";

import { DeleteAccountForm, PreferencesForm } from "./account-forms";

export default async function AccountPage() {
  const user = await requireAuthenticatedUser();
  const preferences = await getAccountPreferences(user.id);

  return (
    <section className="account-page" aria-labelledby="account-title">
      <div className="account-heading">
        <p className="eyebrow">Account</p>
        <h1 id="account-title">Your preferences and access.</h1>
      </div>
      <PreferencesForm preferences={preferences} />
      <DeleteAccountForm />
    </section>
  );
}
