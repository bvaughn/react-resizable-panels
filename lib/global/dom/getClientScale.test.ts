import { describe, expect, test } from "vitest";
import { getClientScale } from "./getClientScale";

function createElement({
  clientSize,
  layoutSize
}: {
  clientSize: number;
  layoutSize: number;
}) {
  const element = document.createElement("div");
  Object.defineProperty(element, "offsetWidth", { value: layoutSize });
  element.getBoundingClientRect = () =>
    ({ height: 0, width: clientSize }) as DOMRect;
  return element;
}

describe("getClientScale", () => {
  test("returns the ratio of the client size to the layout size", () => {
    expect(
      getClientScale(
        createElement({ clientSize: 200, layoutSize: 100 }),
        "horizontal"
      )
    ).toBe(2);
    expect(
      getClientScale(
        createElement({ clientSize: 50, layoutSize: 100 }),
        "horizontal"
      )
    ).toBe(0.5);
  });

  test("ignores rounding of layout sizes", () => {
    // offsetWidth is rounded to an integer, but getBoundingClientRect isn't
    expect(
      getClientScale(
        createElement({ clientSize: 333.5, layoutSize: 334 }),
        "horizontal"
      )
    ).toBe(1);
    expect(
      getClientScale(
        createElement({ clientSize: 20.5, layoutSize: 21 }),
        "horizontal"
      )
    ).toBe(1);
  });

  test("returns 1 for elements without a size", () => {
    expect(
      getClientScale(
        createElement({ clientSize: 0, layoutSize: 0 }),
        "horizontal"
      )
    ).toBe(1);
    expect(
      getClientScale(
        createElement({ clientSize: 0, layoutSize: 100 }),
        "horizontal"
      )
    ).toBe(1);
  });
});
