import { describe, expect, test, vi } from "vitest";
import { verifyExpectedWarnings } from "./test-utils";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

function defaultValidateLayout(layout: number[]) {
  return layout;
}

describe("validatePanelGroupLayout", () => {
  test("should accept requested layout if there are no constraints provided", () => {
    expect(
      validatePanelGroupLayout({
        layout: [10, 60, 30],
        panelConstraints: [{}, {}, {}],
        validateLayout: defaultValidateLayout,
      })
    ).toEqual([10, 60, 30]);
  });

  test("should normalize layouts that do not total 100%", () => {
    let layout;
    verifyExpectedWarnings(() => {
      layout = validatePanelGroupLayout({
        layout: [10, 20, 20],
        panelConstraints: [{}, {}, {}],
        validateLayout: defaultValidateLayout,
      });
    }, "Invalid layout total size");
    expect(layout).toEqual([20, 40, 40]);

    verifyExpectedWarnings(() => {
      layout = validatePanelGroupLayout({
        layout: [50, 100, 50],
        panelConstraints: [{}, {}, {}],
        validateLayout: defaultValidateLayout,
      });
    }, "Invalid layout total size");
    expect(layout).toEqual([25, 50, 25]);
  });

  test("should reject layouts that do not match the number of panels", () => {
    expect(() =>
      validatePanelGroupLayout({
        layout: [10, 20, 30],
        panelConstraints: [{}, {}],
        validateLayout: defaultValidateLayout,
      })
    ).toThrow("Invalid 2 panel layout");

    expect(() =>
      validatePanelGroupLayout({
        layout: [50, 50],
        panelConstraints: [{}, {}, {}],
        validateLayout: defaultValidateLayout,
      })
    ).toThrow("Invalid 3 panel layout");
  });

  describe("minimum size constraints", () => {
    test("should adjust the layout to account for minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [
            {
              minSize: 35,
            },
            {},
          ],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([35, 65]);
    });

    test("should account for multiple panels with minimum size constraints", () => {
      expect(
        validatePanelGroupLayout({
          layout: [20, 60, 20],
          panelConstraints: [
            {
              minSize: 25,
            },
            {},
            {
              minSize: 25,
            },
          ],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([25, 50, 25]);
    });
  });

  describe("maximum size constraints", () => {
    test("should adjust the layout to account for maximum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [{}, { maxSize: 65 }],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([35, 65]);
    });

    test("should account for multiple panels with maximum size constraints", () => {
      expect(
        validatePanelGroupLayout({
          layout: [20, 60, 20],
          panelConstraints: [
            {
              maxSize: 15,
            },
            { maxSize: 50 },
            {},
          ],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([15, 50, 35]);
    });
  });

  describe("collapsible panels", () => {
    test("should not collapse a panel that's at or above the minimum size", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [{ collapsible: true, minSize: 25 }, {}],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([25, 75]);
    });

    test("should collapse a panel once it drops below the halfway point between collapsed and minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: [15, 85],
          panelConstraints: [
            {
              collapsible: true,
              collapsedSize: 10,
              minSize: 20,
            },
            {},
          ],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([20, 80]);

      expect(
        validatePanelGroupLayout({
          layout: [14, 86],
          panelConstraints: [
            {
              collapsible: true,
              collapsedSize: 10,
              minSize: 20,
            },
            {},
          ],
          validateLayout: defaultValidateLayout,
        })
      ).toEqual([10, 90]);
    });
  });

  describe("validateLayout", () => {
    test("will call user-provided validateLayout function before validation", () => {
      const validateLayout = vi.fn((layout) => [layout[1], layout[0]]);
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [{}, {}],
          validateLayout,
        })
      ).toEqual([75, 25]);
      expect(validateLayout).toHaveBeenCalledTimes(1);
      expect(validateLayout).toHaveBeenLastCalledWith([25, 75]);
    });

    test("will enforce panel constraints if user-provided validateLayout is invalid", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [
            {
              maxSize: 35,
            },
            {},
          ],
          validateLayout: () => [50, 50],
        })
      ).toEqual([35, 65]);
    });

    test("will warn if user-provided validateLayout function returns an invalid layout", () => {
      vi.spyOn(console, "warn");

      validatePanelGroupLayout({
        layout: [25, 75],
        panelConstraints: [{}, {}],
        validateLayout: () => [25, 25],
      });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenLastCalledWith(
        expect.stringContaining("Invalid layout total size")
      );
    });
  });
});
