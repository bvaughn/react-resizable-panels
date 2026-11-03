import { describe, expect, test } from "vitest";
import { calculateMinimumSizes } from "./calculateMinimumSizes";
import { minimumSizeToPixels } from "./minimumSizeToPixels";
import type { TabsetNode, WorkspaceNode } from "../types";

function tabset(id: string, minWidth?: string, minHeight?: string): TabsetNode {
  return { id, minHeight, minWidth, tabs: [], type: "tabset" };
}

describe("calculateMinimumSizes", () => {
  const root: WorkspaceNode = {
    children: [
      tabset("a", "100px", "50px"),
      {
        children: [tabset("b", "200px", "30px"), tabset("c", "150px", "40px")],
        id: "inner",
        orientation: "vertical",
        type: "split"
      }
    ],
    id: "root",
    orientation: "horizontal",
    type: "split"
  };

  test("adds sizes along a split's direction and takes the largest across it", () => {
    const sizes = calculateMinimumSizes(root, {
      getChromeSize: () => undefined,
      getCollapsedSize: () => undefined,
      getContentMinimumSize: (node) => ({
        height: minimumSizeToPixels(node.minHeight, null),
        width: minimumSizeToPixels(node.minWidth, null)
      }),
      getSeparatorsSize: () => undefined
    });

    expect(sizes.get("a")).toEqual({ height: 50, width: 100 });
    expect(sizes.get("inner")).toEqual({ height: 70, width: 200 });
    expect(sizes.get("root")).toEqual({ height: 70, width: 300 });
  });

  test("includes chrome and separators", () => {
    const sizes = calculateMinimumSizes(root, {
      getChromeSize: () => ({ height: 20, width: 0 }),
      getCollapsedSize: () => undefined,
      getContentMinimumSize: (node) => ({
        height: minimumSizeToPixels(node.minHeight, null),
        width: minimumSizeToPixels(node.minWidth, null)
      }),
      getSeparatorsSize: () => 4
    });

    expect(sizes.get("a")).toEqual({ height: 70, width: 100 });
    // Two tabsets (30 + 20, 40 + 20) and a separator
    expect(sizes.get("inner")).toEqual({ height: 114, width: 200 });
    // Two children (100, 200) and a separator
    expect(sizes.get("root")).toEqual({ height: 114, width: 304 });
  });

  test("collapsed tabsets only count their collapsed sizes toward their splits", () => {
    const collapsedRoot: WorkspaceNode = {
      children: [
        { id: "a", minHeight: "100px", tabs: [], type: "tabset" },
        {
          collapsed: true,
          collapsible: true,
          id: "b",
          minHeight: "100px",
          tabs: [],
          type: "tabset"
        }
      ],
      id: "root",
      orientation: "vertical",
      type: "split"
    };

    const sizes = calculateMinimumSizes(collapsedRoot, {
      getChromeSize: () => ({ height: 20, width: 0 }),
      getCollapsedSize: () => 24,
      getContentMinimumSize: (node) => ({
        height: minimumSizeToPixels(node.minHeight, null),
        width: 0
      }),
      getSeparatorsSize: () => 0
    });

    // A collapsed tabset's own minimum is the minimum it expands to
    expect(sizes.get("b")).toEqual({ height: 120, width: 0 });
    expect(sizes.get("root")).toEqual({ height: 144, width: 0 });
  });
});
