import { describe, expect, test } from "vitest";
import type { ResizeItemConstraints } from "../types";
import { calculateDefaultLayout } from "./calculateDefaultLayout";

const c = (
  partial: Partial<ResizeItemConstraints> & { itemId: string }
): ResizeItemConstraints => ({
  collapsedSize: 0,
  collapsible: false,
  defaultSize: undefined,
  disabled: undefined,
  maxSize: 100,
  minSize: 0,
  ...partial
});

describe("calculateDefaultLayout", () => {
  test("inferred", () => {
    expect(
      calculateDefaultLayout([
        c({ itemId: "a" }),
        c({ itemId: "b" }),
        c({ itemId: "c" })
      ])
    ).toMatchInlineSnapshot(`
      {
        "a": 33.333,
        "b": 33.333,
        "c": 33.333,
      }
    `);
  });

  test("explicit", () => {
    expect(
      calculateDefaultLayout([
        c({ itemId: "a", defaultSize: 25 }),
        c({ itemId: "b", defaultSize: 50 }),
        c({ itemId: "c", defaultSize: 25 })
      ])
    ).toMatchInlineSnapshot(`
      {
        "a": 25,
        "b": 50,
        "c": 25,
      }
    `);
  });

  test("mix of explicit and inferred", () => {
    expect(
      calculateDefaultLayout([
        c({ itemId: "a", defaultSize: 25 }),
        c({ itemId: "b" }),
        c({ itemId: "c" })
      ])
    ).toMatchInlineSnapshot(`
      {
        "a": 25,
        "b": 37.5,
        "c": 37.5,
      }
    `);

    expect(
      calculateDefaultLayout([
        c({ itemId: "a", defaultSize: 20 }),
        c({ itemId: "b", defaultSize: 50 }),
        c({ itemId: "c" })
      ])
    ).toMatchInlineSnapshot(`
      {
        "a": 20,
        "b": 50,
        "c": 30,
      }
    `);
  });
});
