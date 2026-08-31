import { NextResponse } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";
import { probeSupabaseAuth } from "@/lib/supabase/probe";
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

      return probeSupabaseAuth(config.url, config.anonKey);
    },
  );

  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
