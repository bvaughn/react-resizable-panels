import { Locator, Page, expect } from "@playwright/test";
import {
  assert,
  getIntersectingRectangle,
  intersects,
} from "react-resizable-panels";
import { getBodyCursorStyle } from "./cursor";
import { verifyFuzzySizes } from "./verify";

type Operation = {
  expectedCursor?: string;
  expectedSizes?: number[];
  size: number;
};

type IntersectingOperation = {
  expectedCursor?: string;
  sizeX?: number;
  sizeY?: number;
};

export async function dragResizeBy(
  page: Page,
  panelResizeHandleId: string,
  delta: number
) {
  const dragHandle = page.locator(
    `[data-panel-resize-handle-id="${panelResizeHandleId}"]`
  );
  const direction = await dragHandle.getAttribute(
    "data-panel-group-direction"
  )!;

  let dragHandleRect = (await dragHandle.boundingBox())!;
  let pageX = dragHandleRect.x + dragHandleRect.width / 2;
  let pageY = dragHandleRect.y + dragHandleRect.height / 2;

  await page.mouse.move(pageX, pageY);
  await page.mouse.down();
  await page.mouse.move(
    direction === "horizontal" ? pageX + delta : pageX,
    direction === "vertical" ? pageY + delta : pageY
  );
  await page.mouse.up();
}

export async function dragResizeIntersecting(
  page: Page,
  outerGroupId: string,
  resizeHandleIds: [string, string],
  ...operationsArray: IntersectingOperation[]
) {
  const [idOne, idTwo] = resizeHandleIds;

  const dragHandleOne = page.locator(
    `[data-panel-resize-handle-id="${idOne}"]`
  );
  const dragHandleTwo = page.locator(
    `[data-panel-resize-handle-id="${idTwo}"]`
  );

  const rectOne = (await dragHandleOne.boundingBox())!;
  const rectTwo = (await dragHandleTwo.boundingBox())!;

  expect(intersects(rectOne, rectTwo, false)).toBe(true);

  const rect = getIntersectingRectangle(rectOne, rectTwo, false);
  const centerPageX = rect.x + rect.width / 2;
  const centerPageY = rect.y + rect.height / 2;

  const panelGroup = page.locator(
    `[data-panel-group][data-panel-group-id="${outerGroupId}"]`
  );
  const panelGroupRect = (await panelGroup.boundingBox())!;

  await page.mouse.move(centerPageX, centerPageY);
  await expect(
    await dragHandleOne.getAttribute("data-resize-handle-state")
  ).toBe("hover");
  await expect(
    await dragHandleTwo.getAttribute("data-resize-handle-state")
  ).toBe("hover");

  await page.mouse.down();
  await expect(
    await dragHandleOne.getAttribute("data-resize-handle-state")
  ).toBe("drag");
  await expect(
    await dragHandleTwo.getAttribute("data-resize-handle-state")
  ).toBe("drag");

  let increment = 20;
  let currentX = centerPageX;
  let currentY = centerPageY;

  for (let index = 0; index < operationsArray.length; index++) {
    const { expectedCursor, sizeX, sizeY } = operationsArray[index]!;

    const pageX =
      sizeX != null
        ? panelGroupRect.x + panelGroupRect.width * sizeX
        : centerPageX;
    const pageY =
      sizeY != null
        ? panelGroupRect.y + panelGroupRect.height * sizeY
        : centerPageY;

    while (currentX !== pageX || currentY !== pageY) {
      currentX =
        currentX < pageX
          ? Math.min(pageX, currentX + increment)
          : Math.max(pageX, currentX - increment);
      currentY =
        currentY < pageY
          ? Math.min(pageY, currentY + increment)
          : Math.max(pageY, currentY - increment);

      await page.mouse.move(currentX, currentY);
    }

    const actualCursor = await getBodyCursorStyle(page);
    await expect(actualCursor).toBe(expectedCursor);
  }

  await page.mouse.up();
  await expect(
    await dragHandleOne.getAttribute("data-resize-handle-state")
  ).toBe("hover");
  await expect(
    await dragHandleTwo.getAttribute("data-resize-handle-state")
  ).toBe("hover");
}

export async function dragResizeTo(
  page: Page,
  panelId: string,
  ...operationsArray: Operation[]
) {
  const panels = page.locator("[data-panel-id]");

  const panelCount = await panels.count();
  let panel = null;
  let panelIndex = 0;
  for (panelIndex = 0; panelIndex < panelCount; panelIndex++) {
    panel = panels.nth(panelIndex);

    const id = await panel.getAttribute("data-panel-id");
    if (id === panelId) {
      break;
    }
  }

  assert(panel !== null, `Panel not found for id "${panelId}"`);

  const dragHandles = page.locator("[data-panel-resize-handle-id]");
  const dragHandlesCount = await dragHandles.count();
  const dragHandle = dragHandles.nth(
    Math.min(dragHandlesCount - 1, panelIndex)
  );
  const dragHandleRect = (await dragHandle.boundingBox())!;

  const panelGroupId = await dragHandle.getAttribute("data-panel-group-id");
  const panelGroup = page.locator(
    `[data-panel-group][data-panel-group-id="${panelGroupId}"]`
  );
  const direction = await panelGroup.getAttribute("data-panel-group-direction");
  const panelGroupRect = (await panelGroup.boundingBox())!;

  let pageX = dragHandleRect.x + dragHandleRect.width / 2;
  let pageY = dragHandleRect.y + dragHandleRect.height / 2;

  const moveIncrement = 1;

  const pageXMin = panelGroupRect.x;
  const pageXMax = panelGroupRect.x + panelGroupRect.width;
  const pageYMin = panelGroupRect.y;
  const pageYMax = panelGroupRect.y + panelGroupRect.height;

  await page.mouse.move(pageX, pageY);
  await page.mouse.down();

  for (let index = 0; index < operationsArray.length; index++) {
    pageX = Math.min(pageXMax - 1, Math.max(pageXMin + 1, pageX));
    pageY = Math.min(pageYMax - 1, Math.max(pageYMin + 1, pageY));

    const operations = operationsArray[index];
    assert(operations != null, `No operation found for index ${index}`);

    const { expectedSizes, expectedCursor, size: nextSize } = operations;

    const prevSize = (await panel.getAttribute("data-panel-size"))!;
    const isExpanding = parseFloat(prevSize) < nextSize;

    // Last panel should drag the handle before it back (left/up)
    // All other panels should drag the handle after it forward (right/down)
    let dragIncrement = 0;
    if (isExpanding) {
      dragIncrement =
        panelIndex === panelCount - 1 ? -moveIncrement : moveIncrement;
    } else {
      dragIncrement =
        panelIndex === panelCount - 1 ? moveIncrement : -moveIncrement;
    }

    const deltaX = direction === "horizontal" ? dragIncrement : 0;
    const deltaY = direction === "vertical" ? dragIncrement : 0;

    while (
      pageX > pageXMin &&
      pageX < pageXMax &&
      pageY > pageYMin &&
      pageY < pageYMax
    ) {
      pageX = Math.min(pageXMax, Math.max(pageXMin, pageX + deltaX));
      pageY = Math.min(pageYMax, Math.max(pageYMin, pageY + deltaY));

      await page.mouse.move(pageX, pageY);

      const currentSizeString = (await panel.getAttribute("data-panel-size"))!;
      const currentSize = parseFloat(currentSizeString);

      if (isExpanding) {
        if (currentSize >= nextSize) {
          break;
        }
      } else {
        if (currentSize <= nextSize) {
          break;
        }
      }
    }

    if (expectedSizes != null) {
      // This resizing approach isn't incredibly precise,
      // so we should allow for minor variations in panel sizes.
      await verifyFuzzySizes(page, 0.25, ...expectedSizes);
    }

    if (expectedCursor != null) {
      const actualCursor = await getBodyCursorStyle(page);

      expect(actualCursor).toBe(expectedCursor);
    }
  }

  await page.mouse.up();
}

export async function imperativeCollapsePanel(page: Page, panelId: string) {
  const panelIdSelect = page.locator("#panelIdSelect");
  await panelIdSelect.selectOption(panelId);

  const button = page.locator("#collapseButton");
  await button.click();
}

export async function imperativeExpandPanel(page: Page, panelId: string) {
  const panelIdSelect = page.locator("#panelIdSelect");
  await panelIdSelect.selectOption(panelId);

  const button = page.locator("#expandButton");
  await button.click();
}

export async function imperativeResizePanel(
  page: Page,
  panelId: string,
  size: number
) {
  const panelIdSelect = page.locator("#panelIdSelect");
  await panelIdSelect.selectOption(panelId);

  const sizeInput = page.locator("#sizeInput");
  await sizeInput.focus();
  await sizeInput.fill(`${size}%`);

  const button = page.locator("#resizeButton");
  await button.click();
}

export async function imperativeResizePanelGroup(
  page: Page,
  panelGroupId: string,
  sizes: string[]
) {
  const panelGroupIdSelect = page.locator("#panelGroupIdSelect");
  panelGroupIdSelect.selectOption(panelGroupId);

  const layoutInput = page.locator("#layoutInput");
  await layoutInput.focus();
  await layoutInput.fill(`[${sizes.join()}]`);

  const setLayoutButton = page.locator("#setLayoutButton");
  await setLayoutButton.click();
}

export async function verifyPanelSizePercentage(
  locator: Locator,
  expectedSize: number
) {
  await expect(await locator.getAttribute("data-panel-size")).toBe(
    expectedSize.toFixed(1)
  );
}

export async function verifyPanelSizePixels(
  locator: Locator,
  expectedSize: number
) {
  await expect(await locator.textContent()).toContain(
    `${expectedSize.toFixed(1)}px`
  );
}
