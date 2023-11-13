import { resizePanel } from "./resizePanel";

describe("resizePanel", () => {
  // Edge case test (issues/206)
  fit("should respect percentage panel constraints if group size is negative", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      resizePanel({
        groupSizePixels: -100,
        panelConstraints: [
          {
            minSizePercentage: 25,
            maxSizePercentage: 75,
          },
        ],
        panelIndex: 0,
        size: 50,
      })
    ).toBe(50);

    expect(console.warn).toHaveBeenCalledTimes(0);
  });

  // Edge case test (issues/206)
  it("should handle pixel panel constraints if group size is negative", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      resizePanel({
        groupSizePixels: -100,
        panelConstraints: [
          {
            minSizePixels: 25,
            maxSizePixels: 75,
          },
        ],
        panelIndex: 0,
        size: 50,
      })
    ).toBe(0);

    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
