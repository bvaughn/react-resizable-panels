import { describe, expect, test } from "vitest";
import type { TabsetNode, WorkspaceNode } from "../types";
import { getResizeReason } from "./getResizeReason";

function tabset(id: string, collapsed = false): TabsetNode {
  return {
    collapsible: true,
    id,
    tabs: [],
    type: "tabset",
    ...(collapsed && { collapsed: true })
  };
}

const nestedSplit: WorkspaceNode = {
  children: [],
  id: "split",
  orientation: "vertical",
  type: "split"
};

describe("getResizeReason", () => {
  test("a resize that doesn't collapse or expand tabsets", () => {
    expect(
      getResizeReason([tabset("a"), tabset("b", true)], new Set(["b"]))
    ).toBe("resize");
  });

  test("a resize that collapses a tabset", () => {
    expect(getResizeReason([tabset("a"), tabset("b")], new Set(["b"]))).toBe(
      "collapse"
    );
  });

  test("a resize that expands a tabset", () => {
    expect(getResizeReason([tabset("a"), tabset("b", true)], new Set())).toBe(
      "expand"
    );
  });

  test("a resize that collapses one tabset and expands another is reported as an expansion", () => {
    expect(
      getResizeReason([tabset("a"), tabset("b", true)], new Set(["a"]))
    ).toBe("expand");
    expect(
      getResizeReason([tabset("a", true), tabset("b")], new Set(["b"]))
    ).toBe("expand");
  });

  test("splits are ignored", () => {
    expect(
      getResizeReason([nestedSplit, tabset("b")], new Set(["split"]))
    ).toBe("resize");
  });
});
