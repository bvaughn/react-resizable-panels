import { Page } from "@playwright/test";

export async function resizeHelper(
  page: Page,
  panelIds: [string, string] | string,
  deltaX: number,
  deltaY: number
) {
  const panelA = page.getByText(`id: ${panelIds[0]}`);
  const panelB = page.getByText(`id: ${panelIds[1]}`);

  const boxA = (await panelA.boundingBox())!;
  const boxB = (await panelB.boundingBox())!;

  let box;
  if (boxA.y === boxB.y) {
    box = {
      x: boxA.x + boxA.width,
      y: boxA.y,
      height: boxA.height,
      width: boxB.x - (boxA.x + boxA.width)
    };
  } else {
    box = {
      x: boxA.x,
      y: boxA.y + boxA.height,
      height: boxB.y - (boxA.y + boxA.height),
      width: boxA.width
    };
  }

  const x0 = box.x + box.width / 2;
  const x1 = x0 + deltaX;

  const y0 = box.y + box.height / 2;
  const y1 = y0 + deltaY;

  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move(x1, y1, {
    steps: 1
  });
  await page.mouse.up();
}
