import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/validation";
import { verifySupabaseEmailToken } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));
  const allowedTypes = new Set([
    "email",
    "recovery",
    "signup",
    "invite",
    "email_change",
    "phone_change",
  ]);

  if (!tokenHash || !type || !allowedTypes.has(type)) {
    return NextResponse.redirect(new URL("/login?error=verification", request.url));
  }

  try {
    const result = await verifySupabaseEmailToken(
      tokenHash,
      type as "email" | "recovery" | "signup" | "invite" | "email_change" | "phone_change",
    );
    if (result.error || !result.user) {
      return NextResponse.redirect(new URL("/login?error=verification", request.url));
    }

    return NextResponse.redirect(new URL(nextPath, request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=verification", request.url));
  }
}
