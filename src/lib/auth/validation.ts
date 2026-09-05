import { normalizePreferences } from "../account/preferences";

export type AuthValidation =
  | { valid: true; value: string }
  | { valid: false; error: string };

export function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validateEmail(email: string): AuthValidation {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return { valid: false, error: "Enter a valid email address." };
  }

  return { valid: true, value: normalizedEmail.toLowerCase() };
}

export function validatePassword(password: string): AuthValidation {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters." };
  }

  return { valid: true, value: password };
}

export function validatePreferences(locale: string, timezone: string) {
  const preferences = normalizePreferences(locale || "en-US", timezone || "UTC");
  return preferences
    ? { valid: true as const, value: preferences }
    : { valid: false as const, error: "Choose a valid locale and IANA timezone." };
}

export function safeNextPath(value: string | null | undefined): string {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/app";
}

export function publicAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "The email or password is incorrect.";
  }
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "An account with this email already exists.";
  }
  if (normalized.includes("email not confirmed") || normalized.includes("not confirmed")) {
    return "Verify your email address before signing in.";
  }
  if (normalized.includes("password")) {
    return "That password could not be accepted. Check it and try again.";
  }

  return "Something went wrong. Please try again.";
}
