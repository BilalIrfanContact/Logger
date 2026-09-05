import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAdminConfig } from "./config";

/**
 * Creates the server-only client used for operations that Supabase Auth does
 * not permit through a user's session, such as deleting auth.users.
 */
export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = requireSupabaseAdminConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
