import { Page } from "@playwright/test";

export async function getBodyCursorStyle(page: Page): Promise<string> {
  return page.evaluate(() => {
    return getComputedStyle(document.body).getPropertyValue("cursor");
  });
}
