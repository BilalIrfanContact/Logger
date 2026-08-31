export type HealthReport =
  | {
      status: "ok";
      configured: true;
      supabase: { configured: true; reachable: true };
    }
  | {
      status: "degraded";
      configured: boolean;
      supabase: {
        configured: boolean;
        reachable: false;
        error?: "dependency_unreachable";
      };
    };

export async function checkHealth(
  configuration: { configured: boolean },
  probeSupabase: () => Promise<boolean>,
): Promise<HealthReport> {
  if (!configuration.configured) {
    return {
      status: "degraded",
      configured: false,
      supabase: { configured: false, reachable: false },
    };
  }

  try {
    if (await probeSupabase()) {
      return {
        status: "ok",
        configured: true,
        supabase: { configured: true, reachable: true },
      };
    }
  } catch {
    // Health responses intentionally expose only a stable error category.
  }

  return {
    status: "degraded",
    configured: true,
    supabase: {
      configured: true,
      reachable: false,
      error: "dependency_unreachable",
    },
  };
}
