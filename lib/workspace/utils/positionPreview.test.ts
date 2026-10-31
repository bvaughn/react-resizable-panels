import { describe, expect, test } from "vitest";
import { positionPreview } from "./positionPreview";

// Simulates a preview offset by its own styles (as with translate: -50% -100%),
// positioned relative to a containing block at (containerX, containerY)
function createPreview({
  containerX = 0,
  containerY = 0,
  offsetX,
  offsetY
}: {
  containerX?: number;
  containerY?: number;
  offsetX: number;
  offsetY: number;
}) {
  const element = document.createElement("div");
  element.style.translate = `${offsetX}px ${offsetY}px`;
  element.getBoundingClientRect = () => {
    const isTranslated = element.style.translate !== "none";
    const x = containerX + (isTranslated ? offsetX : 0);
    const y = containerY + (isTranslated ? offsetY : 0);
    return { height: 0, left: x, top: y, width: 0, x, y } as DOMRect;
  };
  return element;
}

describe("positionPreview", () => {
  test("preserves offsets applied by the preview's own styles", () => {
    const element = createPreview({ offsetX: -50, offsetY: -20 });

    positionPreview(element, { clientX: 100, clientY: 200 });

    expect(element.style.transform).toBe("translate(100px, 200px)");
    expect(element.style.translate).toBe("-50px -20px");
  });

  test("positions relative to the containing block", () => {
    const element = createPreview({
      containerX: 30,
      containerY: 40,
      offsetX: -50,
      offsetY: -20
    });

    positionPreview(element, { clientX: 100, clientY: 200 });
    expect(element.style.transform).toBe("translate(70px, 160px)");

    // The origin is measured once per element
    positionPreview(element, { clientX: 130, clientY: 240 });
    expect(element.style.transform).toBe("translate(100px, 200px)");
  });
});
