import { expect, test } from "@playwright/test";

test("serves the Kept foundation and a safe health response", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your work, in your words." })).toBeVisible();
  await expect(page).toHaveTitle("Kept");
  await expect(page.locator('header[aria-label="Kept"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "Kept home" })).toHaveText("KEPT");

  const health = await request.get("/api/health");
  expect(health.status()).toBe(503);
  expect(health.ok()).toBe(false);
  await expect(await health.json()).toEqual({
    status: "degraded",
    configured: false,
    supabase: { configured: false, reachable: false },
  });
});
