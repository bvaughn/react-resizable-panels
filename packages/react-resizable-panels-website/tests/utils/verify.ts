import { expect, Page } from "@playwright/test";

import { PanelGroupLayoutLogEntry } from "../../src/routes/examples/types";

import { assert } from "react-resizable-panels";
import { getLogEntries } from "./debug";

export async function verifySizes(page: Page, ...expectedSizes: number[]) {
  const panels = page.locator("[data-panel-id]");

  const count = await panels.count();
  expect(count).toBe(expectedSizes.length);

  for (let index = 0; index < count; index++) {
    const panel = await panels.nth(index);
    const textContent = (await panel.textContent()) || "";

    const expectedSize = expectedSizes[index];
    const actualSize = parseFloat(textContent.replace("%", ""));

    expect(actualSize).toBe(expectedSize);
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
  const logEntry = logEntries[logEntries.length - 1];
  assert(logEntry);

  const actualSizes = logEntry.layout;

  expect(actualSizes).toHaveLength(expectedSizes.length);

  for (let index = 0; index < actualSizes.length; index++) {
    const actualSize = actualSizes[index];
    assert(actualSize);

    const expectedSize = expectedSizes[index];
    assert(expectedSize);

    expect(actualSize).toBeGreaterThanOrEqual(expectedSize - precision);
    expect(actualSize).toBeLessThanOrEqual(expectedSize + precision);
  }
}
