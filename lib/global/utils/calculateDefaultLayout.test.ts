import { describe, expect, test } from "vitest";
import { calculateDefaultLayout } from "./calculateDefaultLayout";

describe("calculateDefaultLayout", () => {
  test("inferred", () => {
    expect(
      calculateDefaultLayout([
        { panelId: "a" },
        { panelId: "b" },
        { panelId: "c" }
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
        { panelId: "a", defaultSize: 25 },
        { panelId: "b", defaultSize: 50 },
        { panelId: "c", defaultSize: 25 }
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
        { panelId: "a", defaultSize: 25 },
        { panelId: "b" },
        { panelId: "c" }
      ])
    ).toMatchInlineSnapshot(`
      {
        "a": 25,
        "b": 37.5,
        "c": 37.5,
      }
    `);
  });
});
