import { getAccountPreferences } from "@/lib/supabase/account";
import { requireAuthenticatedUser } from "@/lib/auth/server";

import { AppShell } from "./app-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAuthenticatedUser();
  const preferences = await getAccountPreferences(user.id);

  return <AppShell email={user.email ?? "Signed-in user"} preferences={preferences}>{children}</AppShell>;
}
