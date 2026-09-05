import { describe, expect, it } from "vitest";

import { getSupabaseAdminConfig, getSupabaseConfig } from "./config";

describe("Supabase configuration", () => {
  it("reports missing configuration without exposing an incomplete value", () => {
    expect(getSupabaseConfig({})).toEqual({
      isConfigured: false,
      url: null,
      anonKey: null,
    });
  });

  it("trims configured values and exposes readiness", () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: " https://example.supabase.co ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon-key ",
      }),
    ).toEqual({
      isConfigured: true,
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });

  it("does not consider a partial configuration ready", () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toEqual({
      isConfigured: false,
      url: null,
      anonKey: null,
    });
  });

  it("keeps the service-role key separate from public readiness", () => {
    expect(
      getSupabaseAdminConfig({
        NEXT_PUBLIC_SUPABASE_URL: " https://example.supabase.co ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon-key ",
        SUPABASE_SERVICE_ROLE_KEY: " service-role-key ",
      }),
    ).toEqual({
      isConfigured: true,
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role-key",
    });

    expect(getSupabaseAdminConfig({})).toEqual({
      isConfigured: false,
      url: null,
      serviceRoleKey: null,
    });
  });
});
