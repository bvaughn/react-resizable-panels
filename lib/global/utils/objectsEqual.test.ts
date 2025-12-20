import { describe, expect, test } from "vitest";
import { objectsEqual } from "./objectsEqual";

const EMPTY = {};
const A = { a: 25, b: 75 };
const B = { a: 75, b: 25 };
const C = { a: 75 };

describe("objectsEqual", () => {
  test.each([
    [EMPTY, EMPTY, true],
    [A, A, true],
    [B, B, true],
    [EMPTY, A, false],
    [A, EMPTY, false],
    [A, B, false],
    [B, A, false],
    [A, C, false],
    [C, A, false]
  ])("objectsEqual: %o, %o -> %o", (a, b, expected) => {
    expect(objectsEqual(a, b)).toBe(expected);
  });
});
