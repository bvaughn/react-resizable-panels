import { expect, Page } from "@playwright/test";

import { PanelGroupLayoutLogEntry } from "../../src/routes/examples/types";

import { getLogEntries } from "./debug";

export async function verifySizes(page: Page, ...expectedSizes: number[]) {
  const panels = page.locator("[data-panel-id]");

  const count = await panels.count();
  expect(count).toBe(expectedSizes.length);

  for (let index = 0; index < count; index++) {
    const panel = await panels.nth(index);
    const textContent = (await panel.textContent()) || "";

    const expectedSize = expectedSizes[index];
    const actualSize = parseFloat(textContent.split("\n")[0].replace("%", ""));

    expect(expectedSize).toBe(actualSize);
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
    const actualSizePixels = parseFloat(
      textContent.split("\n")[1].replace("px", "")
    );

    expect(expectedSizePixels).toBe(actualSizePixels);
  }
}

export async function verifyFuzzySizes(
  page: Page,
  precision: number,
  ...expectedSizes: number[]
) {
  const logEntries = await getLogEntries<PanelGroupLayoutLogEntry>(
    page,
    "onLayout"
  );
  const { sizes: actualSizes } = logEntries[logEntries.length - 1];

  expect(actualSizes).toHaveLength(expectedSizes.length);

  for (let index = 0; index < actualSizes.length; index++) {
    const actualSize = actualSizes[index];
    const expectedSize = expectedSizes[index];

    expect(actualSize).toBeGreaterThanOrEqual(expectedSize - precision);
    expect(actualSize).toBeLessThanOrEqual(expectedSize + precision);
  }
}
