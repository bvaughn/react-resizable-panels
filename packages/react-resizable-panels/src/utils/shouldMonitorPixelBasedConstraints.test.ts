import { shouldMonitorPixelBasedConstraints } from "./shouldMonitorPixelBasedConstraints";

describe("shouldMonitorPixelBasedConstraints", () => {
  it("should identify min, max, or collapsed size pixel constraints", () => {
    expect(
      shouldMonitorPixelBasedConstraints([{}, { collapsedSizePixels: 100 }, {}])
    ).toBe(true);

    expect(
      shouldMonitorPixelBasedConstraints([{ minSizePixels: 100 }, {}, {}])
    ).toBe(true);

    expect(
      shouldMonitorPixelBasedConstraints([{}, {}, { maxSizePixels: 100 }])
    ).toBe(true);
  });

  it("should ignore default size constraints", () => {
    expect(
      shouldMonitorPixelBasedConstraints([{ defaultSizePixels: 100 }])
    ).toBe(false);
  });
});
