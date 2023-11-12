import { expect, Page } from "@playwright/test";

import { PanelGroupLayoutLogEntry } from "../../src/routes/examples/types";

import { getLogEntries } from "./debug";

export async function verifySizesPercentages(
  page: Page,
  ...expectedSizes: number[]
) {
  const panels = page.locator("[data-panel-id]");

  const count = await panels.count();
  expect(count).toBe(expectedSizes.length);

  for (let index = 0; index < count; index++) {
    const panel = await panels.nth(index);
    const textContent = (await panel.textContent()) || "";

    const expectedSize = expectedSizes[index];
    const rows = textContent.split("\n");
    const actualSize =
      rows.length === 2 ? parseFloat(rows[0].replace("%", "")) : NaN;

    expect(actualSize).toBe(expectedSize);
  }
}

export async function verifySizesPixels(
  page: Page,
  ...expectedSizesPixels: number[]
) {
  const panels = page.locator("[data-panel-id]");

  const count = await panels.count();
  expect(count).toBe(expectedSizesPixels.length);

  for (let index = 0; index < count; index++) {
    const panel = await panels.nth(index);
    const textContent = (await panel.textContent()) || "";

    const expectedSizePixels = expectedSizesPixels[index];
    const rows = textContent.split("\n");
    const actualSizePixels =
      rows.length === 2 ? parseFloat(rows[1].replace("px", "")) : NaN;

    expect(actualSizePixels).toBe(expectedSizePixels);
  }
}

export async function verifyFuzzySizesPercentages(
  page: Page,
  precision: number,
  ...expectedSizes: number[]
) {
  const logEntries = await getLogEntries<PanelGroupLayoutLogEntry>(
    page,
    "onLayout"
  );
  const actualSizes = logEntries[logEntries.length - 1].layout.map(
    ({ sizePercentage }) => sizePercentage
  );

  expect(actualSizes).toHaveLength(expectedSizes.length);

  for (let index = 0; index < actualSizes.length; index++) {
    const actualSize = actualSizes[index];
    const expectedSize = expectedSizes[index];

    expect(actualSize).toBeGreaterThanOrEqual(expectedSize - precision);
    expect(actualSize).toBeLessThanOrEqual(expectedSize + precision);
  }
}
