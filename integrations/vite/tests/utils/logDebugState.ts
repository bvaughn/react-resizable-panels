import type { Page } from "@playwright/test";

export async function logDebugState(page: Page) {
  console.log(
    await page.evaluate(() => document.querySelector("code")?.outerHTML)
  );
}
