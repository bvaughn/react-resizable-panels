import { expect, type Page } from "@playwright/test";

export async function assertLayoutChangeCounts(
  page: Page,
  layoutChangeCount: number,
  layoutChangedCount: number | undefined = layoutChangeCount
) {
  await expect(
    page.getByText(`"onLayoutChangeCount": ${layoutChangeCount}`)
  ).toBeVisible();
  await expect(
    page.getByText(`"onLayoutChangedCount": ${layoutChangedCount}`)
  ).toBeVisible();
}
