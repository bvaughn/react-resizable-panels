import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { addTab } from "./addTab";
import { closeTab } from "./closeTab";
import { closeTabset } from "./closeTabset";
import { maximizeTabset } from "./maximizeTabset";
import { moveTab } from "./moveTab";
import { normalizeModel } from "./normalizeModel";
import { restoreTabset } from "./restoreTabset";
import { selectTab } from "./selectTab";
import { setSplitLayout } from "./setSplitLayout";
import { updateTab } from "./updateTab";
import { updateTabset } from "./updateTabset";
import type {
  SplitNode,
  TabNode,
  TabsetNode,
  WorkspaceModel,
  WorkspaceModelInput,
  WorkspaceNode
} from "../types";

function tab(id: string): TabNode {
  return { data: { id }, id };
}

function tabset(
  id: string,
  tabIds: string[],
  size?: number | string
): TabsetNode {
  return {
    id,
    selectedId: tabIds[0],
    size,
    tabs: tabIds.map(tab),
    type: "tabset"
  };
}

function split(
  id: string,
  orientation: "horizontal" | "vertical",
  children: WorkspaceNode[],
  size?: number | string
): SplitNode {
  return { children, id, orientation, size, type: "split" };
}

function model(
  root: WorkspaceNode,
  maximizedTabsetId?: string
): WorkspaceModel {
  return maximizedTabsetId === undefined
    ? { root, version: 1 }
    : { maximizedTabsetId, root, version: 1 };
}

// Strips generated ids so trees can be compared structurally
function shape(node: WorkspaceNode): unknown {
  return node.type === "tabset"
    ? {
        selected: node.selectedId,
        size: node.size,
        tabs: node.tabs.map(({ id }) => id)
      }
    : {
        children: node.children.map(shape),
        orientation: node.orientation,
        size: node.size
      };
}

const twoTabsets = model(
  split("root", "horizontal", [
    tabset("a", ["1", "2"], 40),
    tabset("b", ["3"], 60)
  ])
);

describe("workspace model", () => {
  beforeEach(() => {
    resetWarnOnceForTest();
  });

  describe("moveTab", () => {
    test("moves a tab into another tabset and selects it", () => {
      expect(
        shape(
          moveTab(twoTabsets, "1", { region: "center", tabsetId: "b" }).root
        )
      ).toEqual({
        children: [
          { selected: "2", size: 40, tabs: ["2"] },
          { selected: "1", size: 60, tabs: ["3", "1"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("reorders tabs within a tabset", () => {
      const next = moveTab(twoTabsets, "1", { index: 2, tabsetId: "a" });
      expect((next.root as SplitNode).children[0]).toMatchObject({
        tabs: [{ id: "2" }, { id: "1" }]
      });
    });

    test("returns the same model when a tab is dropped where it already is", () => {
      expect(moveTab(twoTabsets, "1", { index: 0, tabsetId: "a" })).toBe(
        twoTabsets
      );
      expect(moveTab(twoTabsets, "1", { index: 1, tabsetId: "a" })).toBe(
        twoTabsets
      );
    });

    test("splits a tabset in the same direction as its split", () => {
      expect(
        shape(moveTab(twoTabsets, "1", { region: "right", tabsetId: "b" }).root)
      ).toEqual({
        children: [
          { selected: "2", size: 40, tabs: ["2"] },
          { selected: "3", size: 30, tabs: ["3"] },
          { selected: "1", size: 30, tabs: ["1"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("splits a tabset in the other direction by wrapping it in a split", () => {
      expect(
        shape(moveTab(twoTabsets, "1", { region: "top", tabsetId: "b" }).root)
      ).toEqual({
        children: [
          { selected: "2", size: 40, tabs: ["2"] },
          {
            children: [
              { selected: "1", size: 50, tabs: ["1"] },
              { selected: "3", size: 50, tabs: ["3"] }
            ],
            orientation: "vertical",
            size: 60
          }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("splits a root tabset", () => {
      const next = moveTab(model(tabset("a", ["1", "2"])), "2", {
        region: "left",
        tabsetId: "a"
      });
      expect(shape(next.root)).toEqual({
        children: [
          { selected: "2", size: 50, tabs: ["2"] },
          { selected: "1", size: 50, tabs: ["1"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("ignores splitting a tabset with its only tab", () => {
      expect(moveTab(twoTabsets, "3", { region: "left", tabsetId: "b" })).toBe(
        twoTabsets
      );
    });

    test("removes an emptied tabset and gives its space to its siblings", () => {
      const next = moveTab(twoTabsets, "3", {
        region: "center",
        tabsetId: "a"
      });
      expect(shape(next.root)).toEqual({
        selected: "3",
        size: undefined,
        tabs: ["1", "2", "3"]
      });
    });

    test("ends a maximize when the maximized tabset is split", () => {
      const maximized = model(twoTabsets.root, "a");
      expect(
        moveTab(maximized, "2", { region: "bottom", tabsetId: "a" })
          .maximizedTabsetId
      ).toBeUndefined();
      expect(
        moveTab(maximized, "2", { index: 0, tabsetId: "a" }).maximizedTabsetId
      ).toBe("a");
    });

    test("does not copy application data", () => {
      const data = { id: "1" };
      const initial = model(
        split("root", "horizontal", [
          { ...tabset("a", []), selectedId: "1", tabs: [{ data, id: "1" }] },
          tabset("b", ["2"])
        ])
      );
      const next = moveTab(initial, "1", { region: "center", tabsetId: "b" });
      expect((next.root as TabsetNode).tabs[1].data).toBe(data);
    });
  });

  describe("moveTab with keepWhenEmpty", () => {
    test("splits a kept tabset with its only tab", () => {
      const kept = model({ ...tabset("only", ["1"]), keepWhenEmpty: true });

      const next = moveTab(kept, "1", { region: "right", tabsetId: "only" });
      expect(shape(next.root)).toEqual({
        children: [
          { selected: undefined, size: 50, tabs: [] },
          { selected: "1", size: 50, tabs: ["1"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });
  });

  describe("addTab", () => {
    test("adds a tab to a tabset and selects it", () => {
      const { added, model: next } = addTab(twoTabsets, tab("4"), {
        index: 0,
        tabsetId: "b"
      });
      expect(added).toBe(true);
      expect((next.root as SplitNode).children[1]).toMatchObject({
        selectedId: "4",
        tabs: [{ id: "4" }, { id: "3" }]
      });
    });

    test("adds a tab without selecting it", () => {
      const { model: next } = addTab(twoTabsets, tab("4"), {
        select: false,
        tabsetId: "b"
      });
      expect((next.root as SplitNode).children[1]).toMatchObject({
        selectedId: "3"
      });
    });

    test("selects a tab that already exists instead of adding it", () => {
      const { added, model: next } = addTab(
        twoTabsets,
        { data: "new data", id: "2" },
        { tabsetId: "b" }
      );
      expect(added).toBe(false);
      expect(shape(next.root)).toEqual({
        children: [
          { selected: "2", size: 40, tabs: ["1", "2"] },
          { selected: "3", size: 60, tabs: ["3"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
      expect((next.root as SplitNode).children[0]).toMatchObject({
        tabs: [{}, { data: { id: "2" } }]
      });
    });

    test("adds to the first tabset by default", () => {
      const { model: next } = addTab(twoTabsets, tab("4"));
      expect((next.root as SplitNode).children[0]).toMatchObject({
        tabs: [{ id: "1" }, { id: "2" }, { id: "4" }]
      });
    });

    test("adds to an empty root tabset", () => {
      const { model: next } = addTab(model(tabset("a", [])), tab("1"));
      expect(shape(next.root)).toEqual({
        selected: "1",
        size: undefined,
        tabs: ["1"]
      });
    });
  });

  describe("closeTab", () => {
    test("selects the neighboring tab when closing the selected tab", () => {
      const next = closeTab(twoTabsets, "1");
      expect((next.root as SplitNode).children[0]).toMatchObject({
        selectedId: "2"
      });
    });

    test("keeps an empty root tabset when the last tab is closed", () => {
      const next = closeTab(closeTab(closeTab(twoTabsets, "1"), "2"), "3");
      expect(shape(next.root)).toEqual({
        selected: undefined,
        size: undefined,
        tabs: []
      });
    });

    test("clears the maximized tabset when it is removed", () => {
      expect(
        closeTab(model(twoTabsets.root, "b"), "3").maximizedTabsetId
      ).toBeUndefined();
    });

    test("keeps a tabset with keepWhenEmpty when its last tab is closed", () => {
      const kept = model(
        split("root", "horizontal", [
          tabset("a", ["1", "2"], 40),
          { ...tabset("b", ["3"], 60), keepWhenEmpty: true }
        ])
      );

      const next = closeTab(kept, "3");
      expect((next.root as SplitNode).children[1]).toMatchObject({
        id: "b",
        keepWhenEmpty: true,
        selectedId: undefined,
        tabs: []
      });
    });

    test("turning off keepWhenEmpty removes an empty tabset", () => {
      const kept = model(
        split("root", "horizontal", [
          tabset("a", ["1", "2"], 40),
          { ...tabset("b", [], 60), keepWhenEmpty: true }
        ])
      );

      const next = updateTabset(kept, "b", { keepWhenEmpty: false });
      expect(shape(next.root)).toEqual({
        selected: "1",
        size: undefined,
        tabs: ["1", "2"]
      });
    });
  });

  describe("maximizing the root tabset", () => {
    test("a root tabset can't be maximized", () => {
      const root = model(tabset("only", ["1"]));
      expect(maximizeTabset(root, "only")).toBe(root);
    });

    test("closing the other tabsets ends a maximize", () => {
      const next = closeTabset(maximizeTabset(twoTabsets, "b"), "a");
      expect(next.root.type).toBe("tabset");
      expect(next.maximizedTabsetId).toBeUndefined();
    });

    test("a maximized root tabset is restored when normalized", () => {
      const next = normalizeModel(model(tabset("only", ["1"]), "only"));
      expect(next.maximizedTabsetId).toBeUndefined();
    });
  });

  describe("closeTabset", () => {
    const kept = model(
      split("root", "horizontal", [
        tabset("a", ["1", "2"], 40),
        { ...tabset("b", [], 60), keepWhenEmpty: true }
      ])
    );

    test("removes a tabset kept when empty", () => {
      expect(shape(closeTabset(kept, "b").root)).toEqual({
        selected: "1",
        size: undefined,
        tabs: ["1", "2"]
      });
    });

    test("removes a tabset along with its tabs", () => {
      expect(shape(closeTabset(twoTabsets, "a").root)).toEqual({
        selected: "3",
        size: undefined,
        tabs: ["3"]
      });
    });

    test("leaves an empty root tabset when the root tabset is closed", () => {
      const root = model({ ...tabset("only", ["1"]), keepWhenEmpty: true });

      expect(closeTabset(root, "only").root).toEqual({
        id: "only",
        selectedId: undefined,
        size: undefined,
        tabs: [],
        type: "tabset"
      });
    });

    test("does nothing for an unknown tabset", () => {
      expect(closeTabset(twoTabsets, "unknown")).toBe(twoTabsets);
    });
  });

  describe("selectTab", () => {
    test("selects a tab", () => {
      const next = selectTab(twoTabsets, "2");
      expect((next.root as SplitNode).children[0]).toMatchObject({
        selectedId: "2"
      });
    });

    test("returns the same model when the tab is already selected", () => {
      expect(selectTab(twoTabsets, "1")).toBe(twoTabsets);
    });
  });

  describe("updateTab and updateTabset", () => {
    test("update only the specified fields", () => {
      const next = updateTab(twoTabsets, "1", {
        disableClose: true,
        title: "One"
      });
      expect(
        ((next.root as SplitNode).children[0] as TabsetNode).tabs[0]
      ).toEqual({
        data: { id: "1" },
        disableClose: true,
        id: "1",
        title: "One"
      });

      const updated = updateTabset(next, "b", { minWidth: "200px" });
      expect((updated.root as SplitNode).children[1]).toMatchObject({
        minWidth: "200px",
        size: 60
      });
    });

    test("replace data instead of merging it", () => {
      const next = updateTab(twoTabsets, "1", { data: { other: true } });
      expect(
        ((next.root as SplitNode).children[0] as TabsetNode).tabs[0].data
      ).toEqual({ other: true });
    });
  });

  test("setSplitLayout updates the sizes of a split's children", () => {
    const next = setSplitLayout(twoTabsets, "root", { a: 25, b: 75 });
    expect(shape(next.root)).toMatchObject({
      children: [{ size: 25 }, { size: 75 }]
    });
  });

  test("maximizeTabset and restoreTabset", () => {
    const maximized = maximizeTabset(twoTabsets, "a");
    expect(maximized.maximizedTabsetId).toBe("a");
    expect(maximizeTabset(maximized, "a")).toBe(maximized);
    expect(maximizeTabset(twoTabsets, "missing")).toBe(twoTabsets);
    expect(restoreTabset(maximized)).toEqual(twoTabsets);
    expect(restoreTabset(twoTabsets)).toBe(twoTabsets);
  });

  describe("normalizeModel", () => {
    test("assigns ids to splits and tabsets without them, based on their position", () => {
      const model: WorkspaceModelInput = {
        root: {
          children: [
            { tabs: [tab("1")], type: "tabset" },
            {
              children: [
                { tabs: [tab("2")], type: "tabset" },
                { tabs: [tab("3")], type: "tabset" }
              ],
              orientation: "vertical",
              type: "split"
            },
            { id: "explicit", tabs: [tab("4")], type: "tabset" }
          ],
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      };

      const normalized = normalizeModel(model);
      const ids = (node: WorkspaceNode): unknown =>
        node.type === "split" ? { [node.id]: node.children.map(ids) } : node.id;

      expect(ids(normalized.root)).toEqual({
        "split-root": [
          "tabset-0",
          { "split-1": ["tabset-1-0", "tabset-1-1"] },
          "explicit"
        ]
      });

      // The same ids are assigned every time (e.g. when server rendering and hydrating)
      expect(normalizeModel(model)).toEqual(normalized);
    });

    test("avoids position-based ids that are used explicitly", () => {
      const normalized = normalizeModel({
        root: {
          children: [
            { tabs: [tab("1")], type: "tabset" },
            { id: "tabset-0", tabs: [tab("2")], type: "tabset" }
          ],
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      });

      expect(
        (normalized.root as SplitNode).children.map(({ id }) => id)
      ).toEqual(["tabset-0-2", "tabset-0"]);
    });

    test("falls back to an empty tabset with the root's id (so it matches when hydrating)", () => {
      const model: WorkspaceModel = {
        root: {
          children: [],
          id: "root",
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      };

      expect(normalizeModel(model).root).toEqual({
        id: "root",
        tabs: [],
        type: "tabset"
      });
      expect(normalizeModel(model)).toEqual(normalizeModel(model));
    });

    test("merges a split into a parent with the same orientation", () => {
      const nested = model(
        split("root", "horizontal", [
          tabset("a", ["1"], 50),
          split(
            "middle",
            "vertical",
            [
              split("inner", "horizontal", [
                tabset("b", ["2"], 50),
                tabset("c", ["3"], 50)
              ])
            ],
            50
          )
        ])
      );

      expect(shape(normalizeModel(nested).root)).toEqual({
        children: [
          { selected: "1", size: 50, tabs: ["1"] },
          { selected: "2", size: 25, tabs: ["2"] },
          { selected: "3", size: 25, tabs: ["3"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("scales percentage sizes to add up to 100, but leaves other sizes alone", () => {
      expect(
        shape(
          normalizeModel(
            model(
              split("root", "horizontal", [
                tabset("a", ["1"], 10),
                tabset("b", ["2"], 30)
              ])
            )
          ).root
        )
      ).toMatchObject({ children: [{ size: 25 }, { size: 75 }] });

      expect(
        shape(
          normalizeModel(
            model(
              split("root", "horizontal", [
                tabset("a", ["1"], "250px"),
                tabset("b", ["2"])
              ])
            )
          ).root
        )
      ).toMatchObject({ children: [{ size: "250px" }, { size: undefined }] });
    });

    test("fixes selections and maximized tabsets that no longer exist", () => {
      const next = normalizeModel(
        model(
          split("root", "horizontal", [
            { ...tabset("a", ["1", "2"]), selectedId: "missing" },
            tabset("b", ["3"])
          ]),
          "missing"
        )
      );
      expect((next.root as SplitNode).children[0]).toMatchObject({
        selectedId: "1"
      });
      expect(next).not.toHaveProperty("maximizedTabsetId");
    });

    test("replaces an empty root split with an empty tabset", () => {
      expect(
        shape(
          normalizeModel(
            model(
              split("root", "horizontal", [tabset("a", []), tabset("b", [])])
            )
          ).root
        )
      ).toEqual({ selected: undefined, size: undefined, tabs: [] });
    });

    test("warns about duplicate ids", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      normalizeModel(
        model(
          split("root", "horizontal", [tabset("a", ["1"]), tabset("b", ["1"])])
        )
      );
      expect(warn).toHaveBeenCalledWith(
        'react-resizable-panels: Duplicate id found in workspace model: "1"'
      );
      warn.mockRestore();
    });
  });
});
