import userEvent from "@testing-library/user-event";
import assert from "node:assert";

export async function moveSeparator(
  deltaInPixels: number,
  separatorId?: string
) {
  const separatorElement = document.querySelector(
    separatorId
      ? `[data-separator][data-testid="${separatorId}"]`
      : "[data-separator]"
  );

  assert(separatorElement instanceof HTMLElement);

  const groupOrientation =
    separatorElement.getAttribute("aria-orientation") === "horizontal"
      ? "vertical"
      : "horizontal";

  let clientX = 0;
  let clientY = 0;

  switch (groupOrientation) {
    case "horizontal": {
      clientX = separatorElement.offsetLeft;
      clientY = separatorElement.offsetHeight / 2;
      break;
    }
    case "vertical": {
      clientX = separatorElement.offsetWidth / 2;
      clientY = separatorElement.offsetTop;
      break;
    }
  }

  // Move the pointer a bit, but not enough to impact the layout
  await userEvent.pointer([
    {
      keys: "[MouseLeft>]",
      coords: {
        clientX,
        clientY
      }
    },
    {
      coords: {
        clientX:
          groupOrientation === "horizontal" ? clientX + deltaInPixels : clientX,
        clientY:
          groupOrientation === "vertical" ? clientY + deltaInPixels : clientY
      }
    },
    {
      keys: "[/MouseLeft]",
      coords: {
        clientX:
          groupOrientation === "horizontal" ? clientX + deltaInPixels : clientX,
        clientY:
          groupOrientation === "vertical" ? clientY + deltaInPixels : clientY
      }
    }
  ]);
}
