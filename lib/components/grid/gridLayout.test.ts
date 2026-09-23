import { describe, expect, test } from "vitest";
import {
  getConstraints,
  getSegments,
  getTracks,
  reconcileAxis,
  resizeAxis,
  validateAxis,
  validateCells
} from "./gridLayout";

describe("Grid track layout", () => {
  test("shares constrained resizing across an axis", () => {
    const constraints = getConstraints(
      getTracks(
        [
          { id: "a", minSize: "20%" },
          { id: "b", minSize: "30%" }
        ],
        0
      ),
      1000,
      document.createElement("div")
    );
    expect(resizeAxis({ a: 50, b: 50 }, constraints, 0, 40)).toEqual({
      a: 70,
      b: 30
    });
    expect(resizeAxis({ a: 50, b: 50 }, constraints, 0, -40)).toEqual({
      a: 20,
      b: 80
    });
  });
  test("converts pixel constraints against space excluding gutters", () => {
    const constraints = getConstraints(
      getTracks([{ defaultSize: 200, minSize: 100 }, {}], 0),
      800,
      document.createElement("div")
    );
    expect(reconcileAxis(undefined, constraints)).toEqual({ 0: 25, 1: 75 });
    expect(constraints[0].minSize).toBe(12.5);
  });
  test("preserves disabled tracks during indirect resizing", () => {
    const constraints = getConstraints(
      getTracks([{}, { disabled: true }, {}], 0),
      1000,
      null
    );
    const next = resizeAxis({ 0: 30, 1: 40, 2: 30 }, constraints, 0, 10);
    expect(next).toEqual({ 0: 40, 1: 40, 2: 20 });
  });
  test("validates persistence input", () => {
    const constraints = getConstraints(getTracks(undefined, 2), 1000, null);
    for (const invalid of [
      { 0: 0, 1: 0 },
      { 0: NaN, 1: 50 },
      { 0: 50, other: 50 },
      { 0: -1, 1: 101 }
    ])
      expect(() => validateAxis(invalid, constraints)).toThrow();
    expect(() => getTracks([{ id: "same" }, { id: "same" }], 0)).toThrow(
      "unique"
    );
  });
});

describe("Grid topology", () => {
  const cells = [{ id: "a", row: 1, column: 0, rowSpan: 1, columnSpan: 2 }];
  test("splits a boundary around a spanning cell", () => {
    expect(getSegments("column", 0, 3, cells)).toEqual([
      { start: 0, span: 1 },
      { start: 2, span: 1 }
    ]);
    expect(getSegments("row", 0, 2, cells)).toEqual([{ start: 0, span: 2 }]);
  });
  test("rejects overlaps and out-of-range spans", () => {
    expect(() => validateCells(cells, 1, 2)).toThrow("beyond");
    expect(() =>
      validateCells(
        [...cells, { id: "b", row: 1, column: 1, rowSpan: 1, columnSpan: 1 }],
        2,
        2
      )
    ).toThrow("overlap");
  });
});
