import { describe, expect, test } from "vitest";
import { computePanelFlexBoxStyle } from "./computePanelFlexBoxStyle";

describe("computePanelFlexBoxStyle", () => {
  test("should return flex styles with CSS variable for panel order", () => {
    expect(
      computePanelFlexBoxStyle({
        dragState: null,
        order: 1,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "var(--panel-1-size)",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);
  });

  test("should use correct order in CSS variable", () => {
    expect(
      computePanelFlexBoxStyle({
        dragState: null,
        order: 3,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "var(--panel-3-size)",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);
  });

  test("should disable pointer events during drag", () => {
    expect(
      computePanelFlexBoxStyle({
        dragState: {
          dragHandleId: "handle",
          dragHandleRect: { x: 0, y: 0, width: 10, height: 10 } as DOMRect,
          initialCursorPosition: 100,
          initialLayout: [0.5, 0.5],
        },
        order: 2,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "var(--panel-2-size)",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": "none",
}
`);
  });
});
