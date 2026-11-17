import { describe, expect, test } from "vitest";
import { isLengthSize } from "./isLengthSize";

describe("isLengthSize", () => {
  test("accepts lengths with absolute units", () => {
    for (const size of ["300px", "20rem", "12em", "50vh", "40vw", "0px"]) {
      expect(isLengthSize(size)).toBe(true);
    }
  });

  test("rejects percentages, numbers, and strings without units", () => {
    for (const size of [50, "50%", "50", "px", undefined, "-10px"]) {
      expect(isLengthSize(size)).toBe(false);
    }
  });
});
