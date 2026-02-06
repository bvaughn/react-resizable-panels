import { describe, expect, test } from "vitest";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";
import type { PanelConstraints } from "../../components/panel/types";
import type { Layout } from "../../components/group/types";

function c(partials: Partial<PanelConstraints>[]) {
  const constraints: PanelConstraints[] = [];

  partials.forEach((current, index) => {
    constraints.push({
      collapsedSize: 0,
      collapsible: false,
      defaultSize: undefined,
      disabled: undefined,
      maxSize: 100,
      minSize: 0,
      ...current,
      panelId: "" + index
    });
  });

  return constraints;
}

function l(numbers: number[]) {
  const layout: Layout = {};

  numbers.forEach((current, index) => {
    layout[index] = current;
  });

  return layout;
}

describe("validatePanelGroupLayout", () => {
  test("should accept requested layout if there are no constraints provided", () => {
    expect(
      validatePanelGroupLayout({
        layout: l([10, 60, 30]),
        panelConstraints: c([{}, {}, {}])
      })
    ).toEqual(l([10, 60, 30]));
  });

  test("should normalize layouts that do not total 100%", () => {
    expect(
      validatePanelGroupLayout({
        layout: l([10, 20, 20]),
        panelConstraints: c([{}, {}, {}])
      })
    ).toEqual(l([20, 40, 40]));

    expect(
      validatePanelGroupLayout({
        layout: l([50, 100, 50]),
        panelConstraints: c([{}, {}, {}])
      })
    ).toEqual(l([25, 50, 25]));
  });

  test("should reject layouts that do not match the number of panels", () => {
    expect(() =>
      validatePanelGroupLayout({
        layout: l([10, 20, 30]),
        panelConstraints: c([{}, {}])
      })
    ).toThrow("Invalid 2 panel layout");

    expect(() =>
      validatePanelGroupLayout({
        layout: l([50, 50]),
        panelConstraints: c([{}, {}, {}])
      })
    ).toThrow("Invalid 3 panel layout");
  });

  describe("minimum size constraints", () => {
    test("should adjust the layout to account for minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: l([25, 75]),
          panelConstraints: c([
            {
              minSize: 35
            },
            {}
          ])
        })
      ).toEqual(l([35, 65]));
    });

    test("should account for multiple panels with minimum size constraints", () => {
      expect(
        validatePanelGroupLayout({
          layout: l([20, 60, 20]),
          panelConstraints: c([
            {
              minSize: 25
            },
            {},
            {
              minSize: 25
            }
          ])
        })
      ).toEqual(l([25, 50, 25]));
    });
  });

  describe("maximum size constraints", () => {
    test("should adjust the layout to account for maximum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: l([25, 75]),
          panelConstraints: c([{}, { maxSize: 65 }])
        })
      ).toEqual(l([35, 65]));
    });

    test("should account for multiple panels with maximum size constraints", () => {
      expect(
        validatePanelGroupLayout({
          layout: l([20, 60, 20]),
          panelConstraints: c([
            {
              maxSize: 15
            },
            { maxSize: 50 },
            {}
          ])
        })
      ).toEqual(l([15, 50, 35]));
    });
  });

  describe("collapsible panels", () => {
    test("should not collapse a panel that's at or above the minimum size", () => {
      expect(
        validatePanelGroupLayout({
          layout: l([25, 75]),
          panelConstraints: c([{ collapsible: true, minSize: 25 }, {}])
        })
      ).toEqual(l([25, 75]));
    });

    test("should collapse a panel once it drops below the halfway point between collapsed and minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: l([15, 85]),
          panelConstraints: c([
            {
              collapsible: true,
              collapsedSize: 10,
              minSize: 20
            },
            {}
          ])
        })
      ).toEqual(l([20, 80]));

      expect(
        validatePanelGroupLayout({
          layout: l([14, 86]),
          panelConstraints: c([
            {
              collapsible: true,
              collapsedSize: 10,
              minSize: 20
            },
            {}
          ])
        })
      ).toEqual(l([10, 90]));
    });
  });
});
