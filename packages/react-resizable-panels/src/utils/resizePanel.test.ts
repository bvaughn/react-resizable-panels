import { resizePanel } from "./resizePanel";

describe("resizePanel", () => {
  it("should not collapse (or expand) until a panel size dips below the halfway point between min size and collapsed size", () => {
    expect(
      resizePanel({
        groupSizePixels: 100,
        panelConstraints: [
          {
            collapsible: true,
            collapsedSizePercentage: 10,
            minSizePercentage: 20,
          },
        ],
        panelIndex: 0,
        size: 15,
      })
    ).toBe(20);

    expect(
      resizePanel({
        groupSizePixels: 100,
        panelConstraints: [
          {
            collapsible: true,
            collapsedSizePercentage: 10,
            minSizePercentage: 20,
          },
        ],
        panelIndex: 0,
        size: 14,
      })
    ).toBe(10);

    expect(
      resizePanel({
        groupSizePixels: 100,
        panelConstraints: [
          {
            collapsible: true,
            minSizePercentage: 20,
          },
        ],
        panelIndex: 0,
        size: 10,
      })
    ).toBe(20);

    expect(
      resizePanel({
        groupSizePixels: 100,
        panelConstraints: [
          {
            collapsible: true,
            minSizePercentage: 20,
          },
        ],
        panelIndex: 0,
        size: 9,
      })
    ).toBe(0);
  });

  // Edge case test (issues/206)
  it("should respect percentage panel constraints if group size is negative", () => {
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
