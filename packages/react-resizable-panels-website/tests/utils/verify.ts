import { expect, Page } from "@playwright/test";

import { PanelGroupLayoutLogEntry } from "../../src/routes/examples/types";

import { getLogEntries } from "./debug";

export async function verifySizes(page: Page, ...expectedSizes: number[]) {
  const logEntries = await getLogEntries<PanelGroupLayoutLogEntry>(
    page,
    "onLayout"
  );
  const { sizes: actualSizes } = logEntries[logEntries.length - 1];

  expect(actualSizes).toEqual(expectedSizes);
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

    expect(actualSize).toBeGreaterThan(expectedSize - precision);
    expect(actualSize).toBeLessThan(expectedSize + precision);
  }
}
