import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountPreferences } from "../account/preferences";

import { createSupabaseServerClient } from "./server";

type AccountClient = Pick<SupabaseClient, "from">;

const DEFAULT_PREFERENCES: AccountPreferences = {
  locale: "en-US",
  timezone: "UTC",
};

export async function getAccountPreferences(
  userId: string,
  client?: AccountClient,
): Promise<AccountPreferences> {
  const accountClient = client ?? (await createSupabaseServerClient());
  const { data, error } = await accountClient
    .from("profiles")
    .select("locale, timezone")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? DEFAULT_PREFERENCES;
}

export async function saveAccountPreferences(
  userId: string,
  preferences: AccountPreferences,
  client?: AccountClient,
): Promise<void> {
  const accountClient = client ?? (await createSupabaseServerClient());
  const { error } = await accountClient.from("profiles").upsert(
    {
      id: userId,
      locale: preferences.locale,
      timezone: preferences.timezone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}
