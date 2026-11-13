import { describe, expect, test, vi } from "vitest";
import type { WorkspaceModel } from "../types";
import { assignGrowSizes } from "./assignGrowSizes";

function tabset(id: string, size?: number | string) {
  return {
    id,
    size,
    tabs: [{ data: null, id: `${id}-tab` }],
    type: "tabset" as const
  };
}

describe("assignGrowSizes", () => {
  test("gives the root split's children without lengths a size", () => {
    const model: WorkspaceModel = {
      root: {
        children: [tabset("a", "200px"), tabset("b", 50), tabset("c")],
        id: "root",
        orientation: "vertical",
        type: "split"
      },
      version: 1
    };
    const getSize = vi.fn(
      ({ id }: { id: string }) => `${id === "b" ? 120 : 300}px`
    );

    const next = assignGrowSizes(model, "vertical", getSize);
    expect(next).not.toBe(model);
    expect(
      next.root.type === "split" && next.root.children.map(({ size }) => size)
    ).toEqual(["200px", "120px", "300px"]);
    expect(getSize).toHaveBeenCalledTimes(2);

    // The original model isn't changed
    expect(model.root.type === "split" && model.root.children[1]!.size).toBe(
      50
    );
  });

  test("returns the same model if every row has a length", () => {
    const model: WorkspaceModel = {
      root: {
        children: [tabset("a", "200px"), tabset("b", "10rem")],
        id: "root",
        orientation: "vertical",
        type: "split"
      },
      version: 1
    };

    expect(assignGrowSizes(model, "vertical", () => "1px")).toBe(model);
  });

  test("treats a root that isn't a split in the same direction as the only row", () => {
    const model: WorkspaceModel = {
      root: {
        children: [tabset("a", 50), tabset("b", 50)],
        id: "root",
        orientation: "horizontal",
        type: "split"
      },
      version: 1
    };

    const next = assignGrowSizes(model, "vertical", () => "400px");
    expect(next.root.size).toBe("400px");
    // Its children fit it, as usual
    expect(
      next.root.type === "split" && next.root.children.map(({ size }) => size)
    ).toEqual([50, 50]);
  });
});
