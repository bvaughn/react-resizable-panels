import { verifyExpectedWarnings } from "./test-utils";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

describe("validatePanelGroupLayout", () => {
  it("should accept requested layout if there are no constraints provided", () => {
    expect(
      validatePanelGroupLayout({
        groupSizePixels: NaN,
        layout: [10, 60, 30],
        panelConstraints: [{}, {}, {}],
      })
    ).toEqual([10, 60, 30]);
  });

  it("should reject layouts that do not total 100%", () => {
    verifyExpectedWarnings(
      () =>
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [10, 20, 30],
          panelConstraints: [{}, {}, {}],
        }),
      "Invalid layout total size"
    );

    verifyExpectedWarnings(
      () =>
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [50, 100, 150],
          panelConstraints: [{}, {}, {}],
        }),
      "Invalid layout total size"
    );
  });

  it("should reject layouts that do not match the number of panels", () => {
    expect(() =>
      validatePanelGroupLayout({
        groupSizePixels: NaN,
        layout: [10, 20, 30],
        panelConstraints: [{}, {}],
      })
    ).toThrow("Invalid 2 panel layout");

    expect(() =>
      validatePanelGroupLayout({
        groupSizePixels: NaN,
        layout: [50, 50],
        panelConstraints: [{}, {}, {}],
      })
    ).toThrow("Invalid 3 panel layout");
  });

  describe("minimum size constraints", () => {
    it("should adjust the layout to account for minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [25, 75],
          panelConstraints: [
            {
              minSizePercentage: 35,
            },
            {},
          ],
        })
      ).toEqual([35, 65]);
    });

    it("should adjust the layout to account for minimum pixel sizes", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: 400,
          layout: [20, 80],
          panelConstraints: [
            {
              minSizePixels: 100,
            },
            {},
          ],
        })
      ).toEqual([25, 75]);
    });

    it("should account for multiple panels with minimum size constraints", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [20, 60, 20],
          panelConstraints: [
            {
              minSizePercentage: 25,
            },
            {},
            {
              minSizePercentage: 25,
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
          groupSizePixels: NaN,
          layout: [25, 75],
          panelConstraints: [{}, { maxSizePercentage: 65 }],
        })
      ).toEqual([35, 65]);
    });

    it("should adjust the layout to account for maximum pixel sizes", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: 400,
          layout: [20, 80],
          panelConstraints: [
            {},
            {
              maxSizePixels: 100,
            },
          ],
        })
      ).toEqual([75, 25]);
    });

    it("should account for multiple panels with maximum size constraints", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [20, 60, 20],
          panelConstraints: [
            {
              maxSizePercentage: 15,
            },
            { maxSizePercentage: 50 },
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
          groupSizePixels: NaN,
          layout: [25, 75],
          panelConstraints: [{ collapsible: true, minSizePercentage: 25 }, {}],
        })
      ).toEqual([25, 75]);
    });

    it("should collapse a panel once it drops below the halfway point between collapsed and minimum percentage sizes", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [15, 85],
          panelConstraints: [
            {
              collapsible: true,
              collapsedSizePercentage: 10,
              minSizePercentage: 20,
            },
            {},
          ],
        })
      ).toEqual([20, 80]);

      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [14, 86],
          panelConstraints: [
            {
              collapsible: true,
              collapsedSizePercentage: 10,
              minSizePercentage: 20,
            },
            {},
          ],
        })
      ).toEqual([10, 90]);
    });

    it("should collapse a panel once it drops below the halfway point between collapsed and minimum pixel sizes", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: 400,
          layout: [20, 80],
          panelConstraints: [
            {
              collapsible: true,
              collapsedSizePixels: 0,
              minSizePixels: 100,
            },
            {},
          ],
        })
      ).toEqual([25, 75]);

      expect(
        validatePanelGroupLayout({
          groupSizePixels: 400,
          layout: [10, 90],
          panelConstraints: [
            {
              collapsible: true,
              collapsedSizePixels: 0,
              minSizePixels: 100,
            },
            {},
          ],
        })
      ).toEqual([0, 100]);
    });
  });

  describe("combination of minimum and maximum size constraints", () => {
    it("three panel min/max configuration", () => {
      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [25, 50, 25],
          panelConstraints: [
            { minSizePercentage: 10, maxSizePercentage: 25 },
            { maxSizePercentage: 75 },
            { minSizePercentage: 10, maxSizePercentage: 50 },
          ],
        })
      ).toEqual([25, 50, 25]);

      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [5, 80, 15],
          panelConstraints: [
            { minSizePercentage: 10, maxSizePercentage: 25 },
            { maxSizePercentage: 75 },
            { minSizePercentage: 10, maxSizePercentage: 50 },
          ],
        })
      ).toEqual([10, 75, 15]);

      expect(
        validatePanelGroupLayout({
          groupSizePixels: NaN,
          layout: [30, 10, 60],
          panelConstraints: [
            { minSizePercentage: 10, maxSizePercentage: 25 },
            { maxSizePercentage: 75 },
            { minSizePercentage: 10, maxSizePercentage: 50 },
          ],
        })
      ).toEqual([25, 25, 50]);
    });
  });
});
