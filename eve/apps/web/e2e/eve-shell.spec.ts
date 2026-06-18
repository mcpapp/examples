import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const adapterVersion = require("@mcpapp/eve/package.json").version as string;
const fixtureRenderBudgetMs = 5_000;

test("renders the Eve-loaded hello world spec", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hello world" }),
  ).toBeVisible({ timeout: 90_000 });
});

test("renders the fixture-mode initial spec within the SSR budget", async ({
  page,
}) => {
  test.skip(
    !supportsBudgetedInitialSpecLoad(adapterVersion),
    `@mcpapp/eve ${adapterVersion} does not include the initial stream abort fix.`,
  );

  const startedAt = performance.now();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hello world" })).toBeVisible({
    timeout: fixtureRenderBudgetMs,
  });

  expect(performance.now() - startedAt).toBeLessThan(fixtureRenderBudgetMs);
});

function supportsBudgetedInitialSpecLoad(version: string): boolean {
  const [major = 0, minor = 0, patch = 0] = version
    .split(".")
    .map((part) => Number.parseInt(part, 10));

  return major > 0 || minor > 1 || (minor === 1 && patch >= 1);
}
