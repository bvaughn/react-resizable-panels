import { describe, expect, test } from "vitest";
import type { PanelConstraints } from "../../components/panel/types";
import { calculateSeparatorAriaValues } from "./calculateSeparatorAriaValues";

const DEFAULT_PANEL_CONSTRAINTS = {
  collapsedSize: 0,
  collapsible: false,
  defaultSize: undefined,
  minSize: 0,
  maxSize: 100
};

describe("calculateSeparatorAriaValues", () => {
  test("should calculate the correct min/max/now values for collapsible panels", () => {
    const panelConstraints: PanelConstraints[] = [
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        collapsedSize: 5,
        collapsible: true,
        maxSize: 70,
        minSize: 20,
        panelId: "left"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 20,
        panelId: "right"
      }
    ];

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 35, right: 65 },
        panelId: "left",
        panelConstraints,
        panelIndex: 0
      })
    ).toMatchInlineSnapshot(`
      {
        "valueMax": 70,
        "valueMin": 5,
        "valueNow": 35,
      }
    `);
  });

  test("should consider other panel constraints when computing min/max values", () => {
    const panelConstraints: PanelConstraints[] = [
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 10,
        panelId: "left"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 20,
        panelId: "center"
      },
      {
        ...DEFAULT_PANEL_CONSTRAINTS,
        minSize: 30,
        panelId: "right"
      }
    ];

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 35, center: 25, right: 40 },
        panelConstraints,
        panelId: "center",
        panelIndex: 1
      })
    ).toMatchInlineSnapshot(`
      {
        "valueMax": 35,
        "valueMin": 20,
        "valueNow": 25,
      }
    `);

    expect(
      calculateSeparatorAriaValues({
        layout: { left: 10, center: 35, right: 55 },
        panelConstraints,
        panelId: "center",
        panelIndex: 1
      })
    ).toMatchInlineSnapshot(`
      {
        "valueMax": 60,
        "valueMin": 20,
        "valueNow": 35,
      }
    `);
  });
});
