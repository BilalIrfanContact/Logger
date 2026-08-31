import { describe, expect, it } from "vitest";

import { checkHealth } from "./check";

describe("application health", () => {
  it("reports missing provider configuration without probing the network", async () => {
    let probeCalled = false;

    const report = await checkHealth({ configured: false }, async () => {
      probeCalled = true;
      return true;
    });

    expect(probeCalled).toBe(false);
    expect(report).toEqual({
      status: "degraded",
      configured: false,
      supabase: { configured: false, reachable: false },
    });
  });

  it("reports a healthy configured provider", async () => {
    await expect(checkHealth({ configured: true }, async () => true)).resolves.toEqual({
      status: "ok",
      configured: true,
      supabase: { configured: true, reachable: true },
    });
  });

  it("hides provider error details when the dependency is unavailable", async () => {
    const report = await checkHealth({ configured: true }, async () => {
      throw new Error("secret provider response");
    });

    expect(report).toEqual({
      status: "degraded",
      configured: true,
      supabase: {
        configured: true,
        reachable: false,
        error: "dependency_unreachable",
      },
    });
    expect(JSON.stringify(report)).not.toContain("secret provider response");
  });
});
