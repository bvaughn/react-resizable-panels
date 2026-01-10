import { expect, test } from "@playwright/test";
import { resizeHelper } from "../src/utils/pointer-interactions/resizeHelper";

// High level tests; more nuanced scenarios are covered by unit tests
test.describe("default layouts", () => {
  test("should not cause layout shift for client components", async ({
    page
  }) => {
    await page.goto("http://localhost:3012/");
    await expect(page.getByText("No layout shift")).toBeVisible();

    await resizeHelper(page, ["top", "bottom"], 0, -25);
    await page.waitForTimeout(1000); // Wait for saved layout to be flushed

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("No layout shift")).toBeVisible();
  });

  test("should not cause layout shift for server-rendered client components", async ({
    page
  }) => {
    await page.goto("http://localhost:3011/");
    await expect(page.getByText("No layout shift")).toBeVisible();

    await resizeHelper(page, ["top", "bottom"], 0, -25);
    await page.waitForTimeout(1000); // Wait for saved layout to be flushed

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("No layout shift")).toBeVisible();
  });

  test("should not cause layout shift for server components", async ({
    page
  }) => {
    await page.goto("http://localhost:3010/");
    await expect(page.getByText("No layout shift")).toBeVisible();

    await resizeHelper(page, ["top", "bottom"], 0, -25);
    await page.waitForTimeout(1000); // Wait for saved layout to be flushed

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("No layout shift")).toBeVisible();
  });
});
