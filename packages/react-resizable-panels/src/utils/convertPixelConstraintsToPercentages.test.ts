import { convertPixelConstraintsToPercentages } from "./convertPixelConstraintsToPercentages";

describe("convertPixelConstraintsToPercentages", () => {
  it("should respect percentage panel constraints if group size is negative", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      convertPixelConstraintsToPercentages(
        {
          minSizePercentage: 25,
          defaultSizePercentage: 50,
          maxSizePercentage: 75,
        },
        -100
      )
    ).toEqual({
      collapsedSizePercentage: 0,
      defaultSizePercentage: 50,
      maxSizePercentage: 75,
      minSizePercentage: 25,
    });

    expect(console.warn).toHaveBeenCalledTimes(0);
  });

  // Edge case test (issues/206)
  it("should ignore pixel panel constraints if group size is negative", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      convertPixelConstraintsToPercentages(
        {
          minSizePixels: 25,
          maxSizePixels: 75,
        },
        -100
      )
    ).toEqual({
      collapsedSizePercentage: 0,
      defaultSizePercentage: undefined,
      maxSizePercentage: 0,
      minSizePercentage: 0,
    });

    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
