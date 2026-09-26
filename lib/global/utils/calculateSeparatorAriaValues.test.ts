import { describe, expect, test } from "vitest";
import type { ResizeItemConstraints } from "../types";
import { calculateSeparatorAriaValues } from "./calculateSeparatorAriaValues";

const DEFAULT_PANEL_CONSTRAINTS = {
  collapsedSize: 0,
  collapsible: false,
  defaultSize: undefined,
  disabled: undefined,
  minSize: 0,
  maxSize: 100
};

describe("calculateSeparatorAriaValues", () => {
  test("should calculate the correct min/max/now values for collapsible panels", () => {
    const panelConstraints: ResizeItemConstraints[] = [
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        collapsedSize: 5,
        collapsible: true,
        disabled: undefined,
        maxSize: 70,
        minSize: 20,
        itemId: "left"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 20,
        itemId: "right"
      }
    ];

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 35, right: 65 },
        itemId: "left",
        itemConstraints: panelConstraints,
        itemIndex: 0
      })
    ).toMatchInlineSnapshot(`
      {
        "valueControls": "left",
        "valueMax": 70,
        "valueMin": 5,
        "valueNow": 35,
      }
    `);
  });

  test("should consider other panel constraints when computing min/max values", () => {
    const panelConstraints: ResizeItemConstraints[] = [
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 10,
        itemId: "left"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 20,
        itemId: "center"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 30,
        itemId: "right"
      }
    ];

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 35, center: 25, right: 40 },
        itemConstraints: panelConstraints,
        itemId: "center",
        itemIndex: 1
      })
    ).toMatchInlineSnapshot(`
      {
        "valueControls": "center",
        "valueMax": 35,
        "valueMin": 20,
        "valueNow": 25,
      }
    `);

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 10, center: 35, right: 55 },
        itemConstraints: panelConstraints,
        itemId: "center",
        itemIndex: 1
      })
    ).toMatchInlineSnapshot(`
      {
        "valueControls": "center",
        "valueMax": 60,
        "valueMin": 20,
        "valueNow": 35,
      }
    `);
  });

  test("should assign aria-controls if an explicit id was passed as a prop", () => {
    const panelConstraints: ResizeItemConstraints[] = [
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        collapsedSize: 5,
        collapsible: true,
        maxSize: 70,
        minSize: 20,
        itemId: "left"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 20,
        itemId: "right"
      }
    ];

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 35, right: 65 },
        itemId: "left",
        itemConstraints: panelConstraints,
        itemIndex: 0
      })
    ).toMatchInlineSnapshot(`
      {
        "valueControls": "left",
        "valueMax": 70,
        "valueMin": 5,
        "valueNow": 35,
      }
    `);
  });
});
