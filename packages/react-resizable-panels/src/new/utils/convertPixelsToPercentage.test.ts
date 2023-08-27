import { convertPixelsToPercentage } from "./convertPixelsToPercentage";

describe("convertPixelsToPercentage", () => {
  it("should convert pixels to percentages", () => {
    expect(convertPixelsToPercentage(0, 100_000)).toBe(0);
    expect(convertPixelsToPercentage(50_000, 100_000)).toBe(50);
    expect(convertPixelsToPercentage(100_000, 100_000)).toBe(100);
  });
});
