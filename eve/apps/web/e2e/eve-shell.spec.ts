import { expect, test } from "@playwright/test";

test("renders the Eve-loaded hello world spec", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hello world" }),
  ).toBeVisible({ timeout: 90_000 });
});
