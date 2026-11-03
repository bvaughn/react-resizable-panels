import { describe, expect, test } from "vitest";
import { normalizeWorkspaceModel } from "./normalizeWorkspaceModel";
import type { TabNode, WorkspaceModel } from "../types";

type TabData = { kind: string };

function tab(id: string, title = id): TabNode<TabData> {
  return { data: { kind: id }, id, title };
}

function createSavedModel(): WorkspaceModel<TabData> {
  return {
    maximizedTabsetId: "right",
    root: {
      children: [
        {
          id: "left",
          selectedId: "b",
          size: 30,
          tabs: [tab("a"), tab("b")],
          type: "tabset"
        },
        {
          children: [
            {
              id: "top",
              selectedId: "c",
              size: 50,
              tabs: [tab("c")],
              type: "tabset"
            },
            {
              id: "right",
              selectedId: "d",
              size: 50,
              tabs: [tab("d")],
              type: "tabset"
            }
          ],
          id: "column",
          orientation: "vertical",
          size: 70,
          type: "split"
        }
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1
  };
}

describe("normalizeWorkspaceModel", () => {
  test("returns null for values that aren't models", () => {
    expect(normalizeWorkspaceModel(undefined)).toBeNull();
    expect(normalizeWorkspaceModel(null)).toBeNull();
    expect(normalizeWorkspaceModel("model")).toBeNull();
    expect(normalizeWorkspaceModel({ version: 1 })).toBeNull();
    expect(
      normalizeWorkspaceModel({ root: { type: "tabset" }, version: 1 })
    ).toBeNull();
    expect(
      normalizeWorkspaceModel({ ...createSavedModel(), version: 2 })
    ).toBeNull();
  });

  test("returns a valid model unchanged (but not the same object)", () => {
    const saved = createSavedModel();
    const model = normalizeWorkspaceModel(saved);

    expect(model).toEqual(saved);
    expect(model).not.toBe(saved);
  });

  test("tidies a model the way the Workspace does", () => {
    const model = normalizeWorkspaceModel({
      root: {
        children: [
          { size: 20, tabs: [tab("a")], type: "tabset" },
          { size: 20, tabs: [], type: "tabset" },
          { size: 20, tabs: [tab("b")], type: "tabset" }
        ],
        orientation: "horizontal",
        type: "split"
      },
      version: 1
    });

    expect(model).toEqual({
      root: {
        children: [
          {
            id: "tabset-0",
            selectedId: "a",
            size: 50,
            tabs: [tab("a")],
            type: "tabset"
          },
          {
            id: "tabset-2",
            selectedId: "b",
            size: 50,
            tabs: [tab("b")],
            type: "tabset"
          }
        ],
        id: "split-root",
        orientation: "horizontal",
        type: "split"
      },
      version: 1
    });
  });

  test("replaces tabs with the ones mapTab returns, and removes tabs it returns null for", () => {
    const current = new Map([
      ["a", tab("a", "A (current)")],
      ["c", tab("c", "C (current)")]
    ]);
    const saved = createSavedModel();
    const model = normalizeWorkspaceModel(saved, {
      mapTab: (tab) => current.get(tab.id) ?? null
    })!;

    // The selected tab ("b") was removed, so another one is selected;
    // the "right" tabset is removed (with its last tab), so its split is replaced by the remaining tabset, and nothing is maximized
    expect(model).toEqual({
      root: {
        children: [
          {
            id: "left",
            selectedId: "a",
            size: 30,
            tabs: [tab("a", "A (current)")],
            type: "tabset"
          },
          {
            id: "top",
            selectedId: "c",
            size: 70,
            tabs: [tab("c", "C (current)")],
            type: "tabset"
          }
        ],
        id: "root",
        orientation: "horizontal",
        type: "split"
      },
      version: 1
    });

    // The saved model isn't changed
    expect(saved).toEqual(createSavedModel());
  });

  test("keeps empty tabsets with the keepWhenEmpty flag", () => {
    const saved = createSavedModel();
    const left = (saved.root as { children: WorkspaceModel["root"][] })
      .children[0];
    if (left.type === "tabset") {
      left.keepWhenEmpty = true;
    }

    const model = normalizeWorkspaceModel(saved, {
      mapTab: (tab) => (tab.id === "a" || tab.id === "b" ? null : tab)
    })!;

    expect(model.root.type === "split" && model.root.children[0]).toEqual({
      id: "left",
      keepWhenEmpty: true,
      size: 30,
      tabs: [],
      type: "tabset"
    });
  });

  test("falls back to an empty root tabset if every tab is removed", () => {
    const model = normalizeWorkspaceModel(createSavedModel(), {
      mapTab: () => null
    });

    expect(model).toEqual({
      root: { id: "root", tabs: [], type: "tabset" },
      version: 1
    });
  });
});
