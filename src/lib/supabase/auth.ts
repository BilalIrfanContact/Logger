import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "./admin";
import { createSupabaseServerClient } from "./server";

export type AuthProvider = "google" | "github";

export type AuthClient = Pick<SupabaseClient, "auth">;

export type AuthUser = Pick<User, "id" | "email" | "email_confirmed_at">;

export type AuthResult = {
  error: Error | null;
  user: AuthUser | null;
};

export async function getSupabaseAuthClient(): Promise<AuthClient> {
  return createSupabaseServerClient();
}

export async function getCurrentSupabaseUser(client?: AuthClient): Promise<AuthUser | null> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { data, error } = await authClient.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function signUpWithPassword(
  input: {
    email: string;
    password: string;
    emailRedirectTo: string;
    locale: string;
    timezone: string;
  },
  client?: AuthClient,
): Promise<AuthResult & { hasSession: boolean }> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { data, error } = await authClient.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: input.emailRedirectTo,
      data: { locale: input.locale, timezone: input.timezone },
    },
  });

  return { error, user: data.user, hasSession: Boolean(data.session) };
}

export async function signInWithPassword(
  email: string,
  password: string,
  client?: AuthClient,
): Promise<AuthResult> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  return { error, user: data.user };
}

export async function startOAuthSignIn(
  provider: AuthProvider,
  redirectTo: string,
  client?: AuthClient,
): Promise<{ error: Error | null; url: string | null }> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { data, error } = await authClient.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  return { error, url: data.url };
}

export async function requestPasswordReset(
  email: string,
  redirectTo: string,
  client?: AuthClient,
): Promise<{ error: Error | null }> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { error } = await authClient.auth.resetPasswordForEmail(email, { redirectTo });
  return { error };
}

export async function exchangeSupabaseCode(
  code: string,
  client?: AuthClient,
): Promise<AuthResult> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { data, error } = await authClient.auth.exchangeCodeForSession(code);
  return { error, user: data.user };
}

export async function verifySupabaseEmailToken(
  tokenHash: string,
  type: "email" | "recovery" | "signup" | "invite" | "email_change" | "phone_change",
  client?: AuthClient,
): Promise<AuthResult> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { data, error } = await authClient.auth.verifyOtp({ token_hash: tokenHash, type });
  return { error, user: data.user };
}

export async function updateSupabasePassword(
  password: string,
  client?: AuthClient,
): Promise<{ error: Error | null }> {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { error } = await authClient.auth.updateUser({ password });
  return { error };
}

export async function signOutFromSupabase(client?: AuthClient) {
  const authClient = client ?? (await getSupabaseAuthClient());
  const { error } = await authClient.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function deleteSupabaseUser(userId: string): Promise<void> {
  const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(userId);
  if (error) {
    throw error;
  }
}

export function isAuthProvider(value: string): value is AuthProvider {
  return value === "google" || value === "github";
}
