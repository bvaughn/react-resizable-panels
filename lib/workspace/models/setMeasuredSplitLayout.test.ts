import { describe, expect, test } from "vitest";
import { getSplitLayoutSignature } from "./getSplitLayoutSignature";
import { setMeasuredSplitLayout } from "./setMeasuredSplitLayout";
import type { SplitNode, TabsetNode, WorkspaceModel } from "../types";

function tabset(id: string, extra: Partial<TabsetNode> = {}): TabsetNode {
  return {
    collapsible: true,
    id,
    selectedId: id,
    tabs: [{ data: null, id }],
    type: "tabset",
    ...extra
  };
}

function createModel(children: TabsetNode[]): WorkspaceModel {
  return {
    root: { children, id: "root", orientation: "horizontal", type: "split" },
    version: 1
  };
}

function getChildren(model: WorkspaceModel) {
  return (model.root as SplitNode).children as TabsetNode[];
}

describe("setMeasuredSplitLayout", () => {
  // The model the layout was measured for: "a" was grown to its minimum size
  const measured = createModel([
    tabset("a", { size: 20 }),
    tabset("b", { size: 80 })
  ]);
  const signature = getSplitLayoutSignature(measured.root as SplitNode);
  const layout = { a: 30, b: 70 };

  test("applies the layout if the split hasn't changed", () => {
    const next = setMeasuredSplitLayout(
      measured,
      "root",
      signature,
      layout,
      new Set()
    );

    expect(getChildren(next).map(({ size }) => size)).toEqual([30, 70]);
  });

  test("doesn't apply the layout to a split with the same children but different sizes", () => {
    // e.g. a saved model restored with setModel after the layout was measured
    const replaced = createModel([
      tabset("a", { size: 40 }),
      tabset("b", { size: 60 })
    ]);

    expect(
      setMeasuredSplitLayout(replaced, "root", signature, layout, new Set())
    ).toBe(replaced);
  });

  test("doesn't apply the layout to a split with the same children but different collapsed tabsets", () => {
    const replaced = createModel([
      tabset("a", { collapsed: true, size: 20 }),
      tabset("b", { size: 80 })
    ]);

    // The layout would expand "a" (it isn't one of the collapsed ids)
    expect(
      setMeasuredSplitLayout(replaced, "root", signature, layout, new Set())
    ).toBe(replaced);
  });

  test("doesn't apply the layout to a split with different children", () => {
    const replaced = createModel([
      tabset("a", { size: 20 }),
      tabset("c", { size: 80 })
    ]);

    expect(
      setMeasuredSplitLayout(replaced, "root", signature, layout, new Set())
    ).toBe(replaced);
  });

  test("doesn't apply the layout if the split no longer exists", () => {
    const replaced: WorkspaceModel = {
      root: tabset("a"),
      version: 1
    };

    expect(
      setMeasuredSplitLayout(replaced, "root", signature, layout, new Set())
    ).toBe(replaced);
  });
});
