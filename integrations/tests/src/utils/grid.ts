import type { Locator, Page } from "@playwright/test";
import { calculateBoxBetween } from "./calculateBoxBetween";
import { getCenterCoordinates } from "./getCenterCoordinates";
import type { Coordinates } from "./types";

export function getCell(page: Page, id: string) {
  return page.getByTestId(id);
}

export function getColumnGridline(page: Page) {
  return page.locator('[role="separator"][aria-orientation="vertical"]');
}

export function getRowGridline(page: Page) {
  return page.locator('[role="separator"][aria-orientation="horizontal"]');
}

/**
 * Center of the gap between two adjacent cells (e.g. the boundary between two columns or two rows)
 */
export async function getBoundaryCenter(
  page: Page,
  [cellIdA, cellIdB]: [string, string]
): Promise<Coordinates> {
  const boxA = (await getCell(page, cellIdA).boundingBox())!;
  const boxB = (await getCell(page, cellIdB).boundingBox())!;

  return getCenterCoordinates(calculateBoxBetween(boxA, boxB));
}

/**
 * Center of the area where four cells meet (e.g. where a column boundary intersects a row boundary)
 */
export async function getIntersectionCenter(
  page: Page,
  topLeftCellId: string,
  bottomRightCellId: string
): Promise<Coordinates> {
  const topLeft = (await getCell(page, topLeftCellId).boundingBox())!;
  const bottomRight = (await getCell(page, bottomRightCellId).boundingBox())!;

  return {
    x: (topLeft.x + topLeft.width + bottomRight.x) / 2,
    y: (topLeft.y + topLeft.height + bottomRight.y) / 2
  };
}

export async function getCenter(locator: Locator): Promise<Coordinates> {
  return getCenterCoordinates((await locator.boundingBox())!);
}

export async function drag(
  page: Page,
  from: Coordinates,
  delta: { x?: number; y?: number },
  steps = 1
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + (delta.x ?? 0), from.y + (delta.y ?? 0), {
    steps
  });
  await page.mouse.up();
}
