import { describe, expect, test } from "vitest";
import type { WorkspaceModel } from "../types";
import { getWorkspaceEdgeShare } from "./getWorkspaceEdgeShare";

// A sidebar beside two stacked tabsets
const model: WorkspaceModel = {
  root: {
    children: [
      {
        id: "a",
        selectedId: "1",
        size: 40,
        tabs: [{ data: undefined, id: "1" }],
        type: "tabset"
      },
      {
        children: [
          {
            id: "b",
            selectedId: "2",
            size: 50,
            tabs: [{ data: undefined, id: "2" }],
            type: "tabset"
          },
          {
            id: "c",
            selectedId: "3",
            size: 50,
            tabs: [
              { data: undefined, id: "3" },
              { data: undefined, id: "4" }
            ],
            type: "tabset"
          }
        ],
        id: "main",
        orientation: "vertical",
        size: 60,
        type: "split"
      }
    ],
    id: "root",
    orientation: "horizontal",
    type: "split"
  },
  version: 1
};

describe("getWorkspaceEdgeShare", () => {
  test("previews an equal share of a root split in the same direction", () => {
    expect(
      getWorkspaceEdgeShare(model, "right", { tabId: "4", type: "tab" })
    ).toBeCloseTo(1 / 3);
  });

  test("previews the space shared after a moved tabset leaves its split", () => {
    // The main split is replaced by its other tabset, and then merged into the root
    expect(
      getWorkspaceEdgeShare(model, "right", { tabsetId: "b", type: "tabset" })
    ).toBeCloseTo(1 / 3);
    // The root is left with the main split, which replaces it (and is in the same direction)
    expect(
      getWorkspaceEdgeShare(model, "bottom", { tabsetId: "a", type: "tabset" })
    ).toBeCloseTo(1 / 3);
  });

  test("previews half of the workspace when the root is wrapped in a new split", () => {
    expect(
      getWorkspaceEdgeShare(model, "top", { tabId: "4", type: "tab" })
    ).toBe(0.5);
  });

  test("previews a drop in a right-to-left layout", () => {
    const rtl: WorkspaceModel = {
      ...model,
      root: {
        ...model.root,
        children: [
          {
            id: "a",
            size: 50,
            tabs: [{ data: undefined, id: "1" }],
            type: "tabset"
          },
          {
            id: "b",
            size: 50,
            tabs: [{ data: undefined, id: "2" }],
            type: "tabset"
          }
        ]
      }
    } as WorkspaceModel;
    // "a" is first in the model (at the screen's right), so it's moved to the model's end, which is a real move (a no-op without converting the edge)
    expect(
      getWorkspaceEdgeShare(
        rtl,
        "left",
        { tabsetId: "a", type: "tabset" },
        true
      )
    ).toBe(0.5);
  });

  test("estimates the share for drops from other workspaces", () => {
    expect(getWorkspaceEdgeShare(model, "left", undefined)).toBeCloseTo(1 / 3);
    expect(getWorkspaceEdgeShare(model, "top", undefined)).toBe(0.5);
  });
});
