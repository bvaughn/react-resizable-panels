import { describe, expect, test } from "vitest";
import type { PanelConstraints } from "../../components/panel/types";
import { calculateDefaultLayout } from "./calculateDefaultLayout";

const c = (
  partial: Partial<PanelConstraints> & { panelId: string }
): PanelConstraints => ({
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
        c({ panelId: "a" }),
        c({ panelId: "b" }),
        c({ panelId: "c" })
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
        c({ panelId: "a", defaultSize: 25 }),
        c({ panelId: "b", defaultSize: 50 }),
        c({ panelId: "c", defaultSize: 25 })
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
        c({ panelId: "a", defaultSize: 25 }),
        c({ panelId: "b" }),
        c({ panelId: "c" })
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
        c({ panelId: "a", defaultSize: 20 }),
        c({ panelId: "b", defaultSize: 50 }),
        c({ panelId: "c" })
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
