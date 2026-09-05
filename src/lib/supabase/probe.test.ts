import { describe, expect, it, vi } from "vitest";

import { probeSupabaseAuth } from "./probe";

describe("Supabase Auth probe", () => {
  it("requests the Auth health endpoint with the public key", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ name: "GoTrue" }), { status: 200 }),
    );

    await expect(
      probeSupabaseAuth("https://example.supabase.co/", "anon-key", fetchImplementation),
    ).resolves.toBe(true);

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/health",
      expect.objectContaining({
        headers: { apikey: "anon-key" },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("reports a non-success response as unreachable", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 503 }),
    );

    await expect(probeSupabaseAuth("https://example.supabase.co", "anon-key", fetchImplementation)).resolves.toBe(
      false,
    );
  });

  it("reports network failures as unreachable", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockRejectedValue(new Error("network down"));

    await expect(probeSupabaseAuth("https://example.supabase.co", "anon-key", fetchImplementation)).resolves.toBe(
      false,
    );
  });
});
