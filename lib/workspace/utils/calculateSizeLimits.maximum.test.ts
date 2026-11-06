import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { calculateSizeLimits } from "./calculateSizeLimits";
import { sizeToPixels } from "./sizeToPixels";
import type { TabsetNode, WorkspaceNode } from "../types";

function tabset(
  id: string,
  maxWidth?: string,
  maxHeight?: string,
  extra?: Partial<TabsetNode>
): TabsetNode {
  return { id, maxHeight, maxWidth, tabs: [], type: "tabset", ...extra };
}

function calculate(
  root: WorkspaceNode,
  {
    chrome = { height: 0, width: 0 },
    collapsedSize = 0,
    separators = 0
  }: {
    chrome?: { height: number; width: number };
    collapsedSize?: number;
    separators?: number;
  } = {}
) {
  return calculateSizeLimits(root, {
    getChromeSize: () => chrome,
    getCollapsedSize: () => collapsedSize,
    getContentMaximumSize: (node) => ({
      height: sizeToPixels(node.maxHeight, null) ?? Infinity,
      width: sizeToPixels(node.maxWidth, null) ?? Infinity
    }),
    // Maximum sizes don't depend on minimum sizes
    getContentMinimumSize: () => ({ height: 0, width: 0 }),
    getSeparatorsSize: () => separators
  }).maximumSizes;
}

describe("calculateSizeLimits (maximum sizes)", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetWarnOnceForTest();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  test("applies a tabset's maximum if another tabset in its split can take up the rest of the space", () => {
    const sizes = calculate(
      {
        children: [tabset("sidebar", "300px"), tabset("main")],
        id: "root",
        orientation: "horizontal",
        type: "split"
      },
      { chrome: { height: 20, width: 0 } }
    );

    expect(sizes.get("sidebar")).toEqual({ height: Infinity, width: 300 });
    expect(sizes.get("main")).toEqual({ height: Infinity, width: Infinity });
    expect(sizes.get("root")).toEqual({ height: Infinity, width: Infinity });
    expect(warn).not.toHaveBeenCalled();
  });

  test("includes chrome", () => {
    const sizes = calculate(
      {
        children: [tabset("sidebar", "300px"), tabset("main")],
        id: "root",
        orientation: "horizontal",
        type: "split"
      },
      { chrome: { height: 20, width: 30 } }
    );

    expect(sizes.get("sidebar")).toEqual({ height: Infinity, width: 330 });
  });

  test("limits a split to the smallest maximum across it", () => {
    const sizes = calculate({
      children: [
        {
          children: [tabset("a", "300px"), tabset("b", "400px")],
          id: "column",
          orientation: "vertical",
          type: "split"
        },
        tabset("main")
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    });

    expect(sizes.get("column")).toEqual({ height: Infinity, width: 300 });
    expect(warn).not.toHaveBeenCalled();
  });

  test("limits a split to the sum of its children's maximums along it (plus separators)", () => {
    const sizes = calculate(
      {
        children: [
          {
            children: [tabset("a", "200px"), tabset("b", "300px")],
            id: "row",
            orientation: "horizontal",
            type: "split"
          },
          tabset("bottom")
        ],
        id: "root",
        orientation: "vertical",
        type: "split"
      },
      { separators: 4 }
    );

    // The row's width is the workspace's width, so its children's maximums can't be applied
    expect(sizes.get("row")).toEqual({ height: Infinity, width: Infinity });
    expect(sizes.get("a")).toEqual({ height: Infinity, width: Infinity });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  test("applies maximums within a split whose own maximum is applied", () => {
    const sizes = calculate(
      {
        children: [
          {
            children: [
              tabset("a", undefined, "200px"),
              tabset("b", undefined, "300px")
            ],
            id: "column",
            orientation: "vertical",
            type: "split"
          },
          {
            children: [tabset("c"), tabset("d")],
            id: "other",
            orientation: "vertical",
            type: "split"
          }
        ],
        id: "root",
        orientation: "vertical",
        type: "split"
      },
      { separators: 4 }
    );

    expect(sizes.get("column")).toEqual({ height: 504, width: Infinity });
    expect(sizes.get("a")).toEqual({ height: 200, width: Infinity });
    expect(sizes.get("b")).toEqual({ height: 300, width: Infinity });
    expect(warn).not.toHaveBeenCalled();
  });

  test("ignores maximums if every child of a split has one", () => {
    const sizes = calculate({
      children: [tabset("a", "300px"), tabset("b", "500px")],
      id: "root",
      orientation: "horizontal",
      type: "split"
    });

    expect(sizes.get("a")).toEqual({ height: Infinity, width: Infinity });
    expect(sizes.get("b")).toEqual({ height: Infinity, width: Infinity });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('Tabset "a"');
    expect(warn.mock.calls[0][0]).toContain("maxWidth");
  });

  test("ignores maximums across the root split and of the root tabset", () => {
    let sizes = calculate({
      children: [tabset("a", undefined, "300px"), tabset("b")],
      id: "root",
      orientation: "horizontal",
      type: "split"
    });
    expect(sizes.get("a")).toEqual({ height: Infinity, width: Infinity });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("maxHeight");

    sizes = calculate(tabset("root", "300px"));
    expect(sizes.get("root")).toEqual({ height: Infinity, width: Infinity });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  test("collapsed tabsets can't take up the rest of the space", () => {
    const sizes = calculate(
      {
        children: [
          tabset("sidebar", "300px"),
          tabset("main", undefined, undefined, {
            collapsed: true,
            collapsible: true
          }),
          tabset("other", "400px")
        ],
        id: "root",
        orientation: "horizontal",
        type: "split"
      },
      { collapsedSize: 24 }
    );

    expect(sizes.get("sidebar")).toEqual({ height: Infinity, width: Infinity });
    // A collapsed tabset's own maximum is the maximum it expands to
    expect(sizes.get("main")).toEqual({ height: Infinity, width: Infinity });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  test("collapsed tabsets count their collapsed sizes toward their splits", () => {
    const sizes = calculate(
      {
        children: [
          {
            children: [
              tabset("a", undefined, "200px"),
              tabset("b", undefined, "300px", {
                collapsed: true,
                collapsible: true
              })
            ],
            id: "column",
            orientation: "vertical",
            type: "split"
          },
          tabset("main")
        ],
        id: "root",
        orientation: "vertical",
        type: "split"
      },
      { collapsedSize: 24 }
    );

    expect(sizes.get("column")).toEqual({ height: 224, width: Infinity });
    expect(sizes.get("b")).toEqual({ height: 300, width: Infinity });
  });
});
