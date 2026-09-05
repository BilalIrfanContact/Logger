"use server";

import { redirect } from "next/navigation";

import { deleteCurrentAccount } from "@/lib/auth/account-deletion";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { formString, validatePreferences } from "@/lib/auth/validation";
import { getCurrentSupabaseUser, deleteSupabaseUser, signOutFromSupabase } from "@/lib/supabase/auth";
import { saveAccountPreferences } from "@/lib/supabase/account";

export type AccountActionState = { error?: string; message?: string };

export async function updatePreferencesAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const preferences = validatePreferences(
    formString(formData, "locale"),
    formString(formData, "timezone"),
  );
  if (!preferences.valid) {
    return { error: preferences.error };
  }

  try {
    const user = await requireAuthenticatedUser();
    await saveAccountPreferences(user.id, preferences.value);
    return { message: "Preferences saved." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Preferences could not be saved. Please try again." };
  }
}

export async function deleteAccountAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  if (formString(formData, "confirmation") !== "DELETE") {
    return { error: "Type DELETE to confirm account deletion." };
  }

  try {
    const deleted = await deleteCurrentAccount({
      getCurrentUser: getCurrentSupabaseUser,
      deleteUser: deleteSupabaseUser,
      signOut: signOutFromSupabase,
    });

    if (!deleted) {
      redirect("/login");
    }
    redirect("/");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Account deletion is unavailable right now. Please try again." };
  }
}
