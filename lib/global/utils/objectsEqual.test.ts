import { describe, expect, test } from "vitest";
import { objectsEqual } from "./objectsEqual";

describe("objectsEqual", () => {
  test.each([
    [{}, {}, true],
    [{ a: 25, b: 75 }, { a: 25, b: 75 }, true],
    [{ a: 75, b: 25 }, { a: 75, b: 25 }, true],
    [{}, { a: 25, b: 75 }, false],
    [{ a: 25, b: 75 }, {}, false],
    [{ a: 25, b: 75 }, { a: 75, b: 25 }, false],
    [{ a: 75, b: 25 }, { a: 25, b: 75 }, false],
    [{ a: 25, b: 75 }, { a: 75 }, false],
    [{ a: 75 }, { a: 25, b: 75 }, false]
  ])("objectsEqual: %o, %o -> %o", (a, b, expected) => {
    expect(objectsEqual(a, b)).toBe(expected);
  });
});
