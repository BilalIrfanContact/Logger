import { redirect } from "next/navigation";

import { getCurrentSupabaseUser, type AuthUser } from "@/lib/supabase/auth";

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    return await getCurrentSupabaseUser();
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
