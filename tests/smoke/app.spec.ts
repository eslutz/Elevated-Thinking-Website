import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function gotoApp(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /systems thinking,\s*designed for reality\./i,
    })
  ).toBeVisible();
}

test("app smoke", async ({ page }) => {
  await gotoApp(page);

  await expect(
    page.getByRole("heading", {
      name: /built for work where decisions actually matter\./i,
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /services/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /lindsey@elevatedthinking\.co/i })
  ).toBeVisible();
});

test("app has no critical accessibility violations", async ({ page }) => {
  await gotoApp(page);

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
