import type { Page } from "@playwright/test";

export async function logDebugState(page: Page) {
  console.log(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("code"))
        .map((element) => element.outerHTML)
        .join("\n\n")
    )
  );
}
