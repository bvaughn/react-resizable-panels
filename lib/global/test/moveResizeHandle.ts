import userEvent from "@testing-library/user-event";
import assert from "node:assert";

export async function moveResizeHandle(
  deltaInPixels: number,
  resizeHandleId?: string
) {
  const resizeHandleElement = document.querySelector(
    resizeHandleId
      ? `[data-resize-handle-id="${resizeHandleId}"]`
      : "[data-resize-handle]"
  );

  assert(resizeHandleElement instanceof HTMLElement);

  const direction =
    resizeHandleElement.parentElement?.getAttribute("data-group-direction") ===
    "vertical"
      ? "vertical"
      : "horizontal";

  let clientX = 0;
  let clientY = 0;

  switch (direction) {
    case "horizontal": {
      clientX = resizeHandleElement.offsetLeft;
      clientY = resizeHandleElement.offsetHeight / 2;
      break;
    }
    case "vertical": {
      clientX = resizeHandleElement.offsetWidth / 2;
      clientY = resizeHandleElement.offsetTop;
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
        clientX: direction === "horizontal" ? clientX + deltaInPixels : clientX,
        clientY: direction === "vertical" ? clientY + deltaInPixels : clientY
      }
    },
    {
      keys: "[/MouseLeft]",
      coords: {
        clientX: direction === "horizontal" ? clientX + deltaInPixels : clientX,
        clientY: direction === "vertical" ? clientY + deltaInPixels : clientY
      }
    }
  ]);
}
