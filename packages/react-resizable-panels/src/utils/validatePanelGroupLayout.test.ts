import { verifyExpectedWarnings } from "./test-utils";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

describe("validatePanelGroupLayout", () => {
  it("should accept requested layout if there are no constraints provided", () => {
    expect(
      validatePanelGroupLayout({
        layout: [10, 60, 30],
        panelConstraints: [{}, {}, {}],
      })
    ).toEqual([10, 60, 30]);
  });

  it("should normalize layouts that do not total 100%", () => {
    let layout;
    verifyExpectedWarnings(() => {
      layout = validatePanelGroupLayout({
        layout: [10, 20, 20],
        panelConstraints: [{}, {}, {}],
      });
    }, "Invalid layout total size");
    expect(layout).toEqual([20, 40, 40]);

    verifyExpectedWarnings(() => {
      layout = validatePanelGroupLayout({
        layout: [50, 100, 50],
        panelConstraints: [{}, {}, {}],
      });
    }, "Invalid layout total size");
    expect(layout).toEqual([25, 50, 25]);
  });

  it("should reject layouts that do not match the number of panels", () => {
    expect(() =>
      validatePanelGroupLayout({
        layout: [10, 20, 30],
        panelConstraints: [{}, {}],
      })
    ).toThrow("Invalid 2 panel layout");

    expect(() =>
      validatePanelGroupLayout({
        layout: [50, 50],
        panelConstraints: [{}, {}, {}],
      })
    ).toThrow("Invalid 3 panel layout");
  });

  describe("minimum size constraints", () => {
    it("should adjust the layout to account for minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [
            {
              minSize: 35,
            },
            {},
          ],
        })
      ).toEqual([35, 65]);
    });

    it("should account for multiple panels with minimum size constraints", () => {
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
        })
      ).toEqual([25, 50, 25]);
    });
  });

  describe("maximum size constraints", () => {
    it("should adjust the layout to account for maximum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [{}, { maxSize: 65 }],
        })
      ).toEqual([35, 65]);
    });

    it("should account for multiple panels with maximum size constraints", () => {
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
        })
      ).toEqual([15, 50, 35]);
    });
  });

  describe("collapsible panels", () => {
    it("should not collapse a panel that's at or above the minimum size", () => {
      expect(
        validatePanelGroupLayout({
          layout: [25, 75],
          panelConstraints: [{ collapsible: true, minSize: 25 }, {}],
        })
      ).toEqual([25, 75]);
    });

    it("should collapse a panel once it drops below the halfway point between collapsed and minimum percentage sizes", () => {
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
        })
      ).toEqual([10, 90]);
    });
  });
});
