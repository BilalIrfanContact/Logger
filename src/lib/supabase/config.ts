export type SupabaseConfig =
  | { isConfigured: false; url: null; anonKey: null }
  | { isConfigured: true; url: string; anonKey: string };

type SupabaseEnvironment = Record<string, string | undefined>;

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getSupabaseConfig(
  environment: SupabaseEnvironment = process.env,
): SupabaseConfig {
  const url = nonEmpty(environment.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = nonEmpty(environment.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    return { isConfigured: false, url: null, anonKey: null };
  }

  return { isConfigured: true, url, anonKey };
}

export function requireSupabaseConfig(): Extract<SupabaseConfig, { isConfigured: true }> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return config;
}
