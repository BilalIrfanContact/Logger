import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/validation";
import { saveAccountPreferences } from "@/lib/supabase/account";
import {
  exchangeSupabaseCode,
  getCurrentSupabaseUser,
} from "@/lib/supabase/auth";
import { normalizePreferences, type AccountPreferences } from "@/lib/account/preferences";

export const dynamic = "force-dynamic";

function redirectToLogin(request: NextRequest, error: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

async function restoreOAuthPreferences(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const value = cookieStore.get("kept-account-preferences")?.value;
  cookieStore.delete("kept-account-preferences");

  if (!value) {
    return;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<AccountPreferences>;
    const preferences = normalizePreferences(parsed.locale ?? "", parsed.timezone ?? "");
    if (preferences) {
      await saveAccountPreferences(userId, preferences);
    }
  } catch {
    // An invalid preference cookie must not interrupt a successful OAuth login.
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (!code) {
    return redirectToLogin(request, "callback");
  }

  try {
    const result = await exchangeSupabaseCode(code);
    if (result.error || !result.user) {
      return redirectToLogin(request, "callback");
    }

    await restoreOAuthPreferences(result.user.id);
    return NextResponse.redirect(new URL(nextPath, request.url));
  } catch {
    return redirectToLogin(request, "callback");
  }
}
