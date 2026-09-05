"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  startOAuthAction,
  type AuthActionState,
  updatePasswordAction,
} from "@/app/actions/auth";

type AuthFormMode = "login" | "register" | "forgot-password" | "reset-password";

const initialState: AuthActionState = {};

function devicePreferences() {
  return {
    locale: typeof navigator === "undefined" ? "en-US" : navigator.language || "en-US",
    timezone:
      typeof Intl === "undefined"
        ? "UTC"
        : Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}

export function AuthForm({ mode, nextPath = "/app" }: { mode: AuthFormMode; nextPath?: string }) {
  const [state, formAction, pending] = useActionState(
    mode === "login"
      ? loginAction
      : mode === "register"
        ? registerAction
        : mode === "forgot-password"
          ? requestPasswordResetAction
          : updatePasswordAction,
    initialState,
  );
  const [preferences, setPreferences] = useState({ locale: "en-US", timezone: "UTC" });

  useEffect(() => {
    setPreferences(devicePreferences());
  }, []);

  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot-password";
  const isResetPassword = mode === "reset-password";
  const title = isRegister
    ? "Create your private journal"
    : isForgotPassword
      ? "Reset your password"
      : isResetPassword
        ? "Choose a new password"
        : "Welcome back";

  return (
    <div className="auth-form">
      <form className="auth-credentials" action={formAction}>
      <div className="auth-form-heading">
        <p className="eyebrow">Kept / private account</p>
        <h1>{title}</h1>
        <p className="auth-copy">
          {isRegister
            ? "Keep your work journal private from the first note onward."
            : isForgotPassword
              ? "We’ll send a secure link if an account uses this email."
              : isResetPassword
                ? "Use at least eight characters for your new password."
                : "Sign in to continue to your work journal."}
        </p>
      </div>

      {!isResetPassword && (
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
      )}

      {!isForgotPassword && (
        <label className="field">
          <span>{isResetPassword ? "New password" : "Password"}</span>
          <input
            name="password"
            type="password"
            autoComplete={isResetPassword || isRegister ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>
      )}

      {(isRegister || isResetPassword) && (
        <label className="field">
          <span>Confirm password</span>
          <input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required />
        </label>
      )}

      {(isRegister || mode === "login") && (
        <>
          <input type="hidden" name="locale" value={preferences.locale} readOnly />
          <input type="hidden" name="timezone" value={preferences.timezone} readOnly />
        </>
      )}
      {mode === "login" && <input type="hidden" name="next" value={nextPath} readOnly />}

      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-message form-success" role="status">{state.message}</p>}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Working…" : isRegister ? "Create account" : isForgotPassword ? "Send reset link" : isResetPassword ? "Update password" : "Sign in"}
      </button>
      </form>

      {mode === "login" && (
        <>
          <div className="auth-divider"><span>or continue with</span></div>
          <OAuthButtons preferences={preferences} />
        </>
      )}

      <div className="auth-links">
        {mode === "login" && <Link href="/forgot-password">Forgot password?</Link>}
        {mode === "login" && <Link href="/register">Create an account</Link>}
        {mode === "register" && <Link href="/login">Already have an account? Sign in</Link>}
        {(isForgotPassword || isResetPassword) && <Link href="/login">Back to sign in</Link>}
      </div>
    </div>
  );
}

function OAuthButtons({ preferences }: { preferences: { locale: string; timezone: string } }) {
  return (
    <div className="oauth-buttons">
      {(["google", "github"] as const).map((provider) => (
        <form key={provider} action={startOAuthAction}>
          <input type="hidden" name="provider" value={provider} readOnly />
          <input type="hidden" name="locale" value={preferences.locale} readOnly />
          <input type="hidden" name="timezone" value={preferences.timezone} readOnly />
          <button className="button button-secondary" type="submit">
            {provider === "google" ? "Continue with Google" : "Continue with GitHub"}
          </button>
        </form>
      ))}
    </div>
  );
}
