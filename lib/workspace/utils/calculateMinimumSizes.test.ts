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
});
