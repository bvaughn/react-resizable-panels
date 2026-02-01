import { describe, expect, test } from "vitest";
import { layoutsEqual } from "./layoutsEqual";
import type { Layout } from "../components/group/types";

const EMPTY: Layout = {};
const A: Layout = { a: 25, b: 75 };
const B: Layout = { a: 75, b: 25 };
const C: Layout = { d: 25, e: 75 };

describe("layoutsEqual", () => {
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
  ])("layoutsEqual: %o, %o -> %o", (a, b, expected) => {
    expect(layoutsEqual(a, b)).toBe(expected);
  });
});
