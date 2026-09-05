import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "./config";

export async function updateSupabaseSession(request: NextRequest) {
  const config = getSupabaseConfig();
  const response = NextResponse.next({ request });

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
    await supabase.auth.getUser();
  } catch {
    // Provider outages must not prevent the health route from reporting degraded status.
  }
  return response;
}
