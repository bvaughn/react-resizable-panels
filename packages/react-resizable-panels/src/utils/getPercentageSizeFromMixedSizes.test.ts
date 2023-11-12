import { getPercentageSizeFromMixedSizes } from "./getPercentageSizeFromMixedSizes";

describe("getPercentageSizeFromMixedSizes", () => {
  it("should return percentage sizes as-is", () => {
    expect(
      getPercentageSizeFromMixedSizes(
        {
          sizePercentage: 50,
        },
        100_000
      )
    ).toBe(50);
    expect(
      getPercentageSizeFromMixedSizes(
        {
          sizePercentage: 25,
          sizePixels: 100,
        },
        100_000
      )
    ).toBe(25);
  });

  it("should convert pixels to percentages", () => {
    expect(
      getPercentageSizeFromMixedSizes(
        {
          sizePixels: 50_000,
        },
        100_000
      )
    ).toBe(50);
    expect(
      getPercentageSizeFromMixedSizes(
        {
          sizePercentage: 25,
          sizePixels: 50_000,
        },
        100_000
      )
    ).toBe(25);
  });

  it("should return undefined if neither pixel nor percentage sizes specified", () => {
    expect(getPercentageSizeFromMixedSizes({}, 100_000)).toBeUndefined();
  });
});
