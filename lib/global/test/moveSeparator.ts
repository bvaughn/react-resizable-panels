import userEvent from "@testing-library/user-event";
import assert from "node:assert";

export async function moveSeparator(
  deltaInPixels: number,
  separatorId?: string
) {
  const separatorElement = document.querySelector(
    separatorId ? `[data-separator="${separatorId}"]` : "[data-separator]"
  );

  assert(separatorElement instanceof HTMLElement);

  const orientation =
    separatorElement.getAttribute("aria-orientation") === "vertical"
      ? "vertical"
      : "horizontal";

  let clientX = 0;
  let clientY = 0;

  switch (orientation) {
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
          orientation === "horizontal" ? clientX + deltaInPixels : clientX,
        clientY: orientation === "vertical" ? clientY + deltaInPixels : clientY
      }
    },
    {
      keys: "[/MouseLeft]",
      coords: {
        clientX:
          orientation === "horizontal" ? clientX + deltaInPixels : clientX,
        clientY: orientation === "vertical" ? clientY + deltaInPixels : clientY
      }
    }
  ]);
}
