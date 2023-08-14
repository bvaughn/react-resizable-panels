import { convertPercentageToPixels } from "./convertPercentageToPixels";

describe("convertPercentageToPixels", () => {
  it("should convert percentages to pixels", () => {
    expect(convertPercentageToPixels(0, 100_000)).toBe(0);
    expect(convertPercentageToPixels(50, 100_000)).toBe(50_000);
    expect(convertPercentageToPixels(100, 100_000)).toBe(100_000);
  });
});
