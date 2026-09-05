export type SupabaseConfig =
  | { isConfigured: false; url: null; anonKey: null }
  | { isConfigured: true; url: string; anonKey: string };

type SupabaseEnvironment = Record<string, string | undefined>;

export type SupabaseAdminConfig =
  | { isConfigured: false; url: null; serviceRoleKey: null }
  | { isConfigured: true; url: string; serviceRoleKey: string };

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

export function getSupabaseAdminConfig(
  environment: SupabaseEnvironment = process.env,
): SupabaseAdminConfig {
  const publicConfig = getSupabaseConfig(environment);
  const serviceRoleKey = nonEmpty(environment.SUPABASE_SERVICE_ROLE_KEY);

  if (!publicConfig.isConfigured || !serviceRoleKey) {
    return { isConfigured: false, url: null, serviceRoleKey: null };
  }

  return { isConfigured: true, url: publicConfig.url, serviceRoleKey };
}

export function requireSupabaseAdminConfig(): Extract<
  SupabaseAdminConfig,
  { isConfigured: true }
> {
  const config = getSupabaseAdminConfig();
  if (!config.isConfigured) {
    throw new Error(
      "Supabase admin access is not configured. Set the public Supabase values and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return config;
}
