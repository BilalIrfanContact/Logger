"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  isAuthProvider,
  requestPasswordReset,
  signInWithPassword,
  signOutFromSupabase,
  signUpWithPassword,
  startOAuthSignIn,
  updateSupabasePassword,
} from "@/lib/supabase/auth";
import { formString, formValue, publicAuthError, safeNextPath, validateEmail, validatePassword, validatePreferences } from "@/lib/auth/validation";

export type AuthActionState = {
  error?: string;
  message?: string;
};

async function siteOrigin(): Promise<string> {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host ?? "localhost:3000"}`;
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = validateEmail(formString(formData, "email"));
  const password = validatePassword(formValue(formData, "password"));
  const confirmation = formValue(formData, "passwordConfirmation");
  const preferences = validatePreferences(
    formString(formData, "locale"),
    formString(formData, "timezone"),
  );
  if (!email.valid) return { error: email.error };
  if (!password.valid) return { error: password.error };
  if (!preferences.valid) return { error: preferences.error };
  if (password.value !== confirmation) {
    return { error: "Passwords do not match." };
  }

  try {
    const result = await signUpWithPassword({
      email: email.value,
      password: password.value,
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/app`,
      locale: preferences.value.locale,
      timezone: preferences.value.timezone,
    });

    if (result.error) {
      return { error: publicAuthError(result.error.message) };
    }

    if (result.hasSession) {
      redirect("/app");
    }

    return { message: "Check your email to verify your account before signing in." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Account creation is unavailable right now. Please try again." };
  }
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = validateEmail(formString(formData, "email"));
  const password = validatePassword(formValue(formData, "password"));
  if (!email.valid) return { error: email.error };
  if (!password.valid) return { error: password.error };

  try {
    const result = await signInWithPassword(email.value, password.value);
    if (result.error) {
      return { error: publicAuthError(result.error.message) };
    }

    redirect(safeNextPath(formString(formData, "next")));
  } catch (caughtError) {
    if (caughtError instanceof Error && caughtError.message.includes("NEXT_REDIRECT")) {
      throw caughtError;
    }
    return { error: "Sign in is unavailable right now. Please try again." };
  }
}

export async function startOAuthAction(formData: FormData): Promise<void> {
  const provider = formString(formData, "provider");
  if (!isAuthProvider(provider)) {
    redirect("/login?error=provider");
  }

  const preferences = validatePreferences(
    formString(formData, "locale"),
    formString(formData, "timezone"),
  );
  if (!preferences.valid) {
    redirect("/login?error=preferences");
  }

  const preferenceCookie = encodeURIComponent(JSON.stringify(preferences.value));
  const cookieStore = await cookies();
  cookieStore.set("kept-account-preferences", preferenceCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  try {
    const result = await startOAuthSignIn(provider, `${await siteOrigin()}/auth/callback?next=/app`);
    if (result.error || !result.url) {
      redirect("/login?error=oauth");
    }
    redirect(result.url);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    redirect("/login?error=oauth");
  }
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = validateEmail(formString(formData, "email"));
  if (!email.valid) {
    return { error: email.error };
  }

  try {
    const result = await requestPasswordReset(
      email.value,
      `${await siteOrigin()}/auth/callback?next=/reset-password`,
    );
    if (result.error) {
      return { error: "We could not send a reset email. Please try again." };
    }
  } catch {
    return { error: "We could not send a reset email. Please try again." };
  }

  return { message: "If an account uses that email, a password reset link is on its way." };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = validatePassword(formValue(formData, "password"));
  const confirmation = formValue(formData, "passwordConfirmation");
  if (!password.valid) {
    return { error: password.error };
  }
  if (password.value !== confirmation) {
    return { error: "Passwords do not match." };
  }

  try {
    const result = await updateSupabasePassword(password.value);
    if (result.error) {
      return { error: publicAuthError(result.error.message) };
    }
    await signOutFromSupabase();
    redirect("/login?message=password-updated");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Password update is unavailable right now. Please try again." };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await signOutFromSupabase();
  } finally {
    redirect("/");
  }
}
