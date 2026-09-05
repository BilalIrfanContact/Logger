import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "./config";

export async function updateSupabaseSession(request: NextRequest) {
  const config = getSupabaseConfig();
  const response = NextResponse.next({ request });
  const isProtectedRoute = request.nextUrl.pathname === "/app" || request.nextUrl.pathname.startsWith("/app/");

  if (!config.isConfigured || !config.url || !config.anonKey) {
    return response;
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    const { data } = await supabase.auth.getUser();
    if (isProtectedRoute && !data.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Provider outages must not prevent the health route from reporting degraded status.
  }
  return response;
}
