import { fuzzyCompareNumbers } from "./fuzzyCompareNumbers";

describe("fuzzyCompareNumbers", () => {
  it("should return 0 when numbers are equal", () => {
    expect(fuzzyCompareNumbers(10.123, 10.123, 5)).toBe(0);
  });

  it("should return 0 when numbers are fuzzy equal", () => {
    expect(fuzzyCompareNumbers(0.000001, 0.000002, 5)).toBe(0);
  });

  it("should return a delta when numbers are not unequal", () => {
    expect(fuzzyCompareNumbers(0.000001, 0.000002, 6)).toBe(-1);
    expect(fuzzyCompareNumbers(0.000005, 0.000002, 6)).toBe(1);
  });
});
