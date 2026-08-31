import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";
import { checkHealth } from "@/platform/health/check";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getSupabaseConfig();
  const report = await checkHealth(
    { configured: config.isConfigured },
    async () => {
      if (!config.isConfigured || !config.url || !config.anonKey) {
        return false;
      }

      const supabase = createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      });
      const { error } = await supabase.auth.getSession();
      return !error;
    },
  );

  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
