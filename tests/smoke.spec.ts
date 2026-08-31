import { expect, test } from "@playwright/test";

test("serves the Logger foundation and a safe health response", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your work, in your words." })).toBeVisible();

  const health = await request.get("/api/health");
  expect(health.status()).toBe(503);
  expect(health.ok()).toBe(false);
  await expect(await health.json()).toEqual({
    status: "degraded",
    configured: false,
    supabase: { configured: false, reachable: false },
  });
});
