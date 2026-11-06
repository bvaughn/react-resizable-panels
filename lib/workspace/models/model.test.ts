import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { addTab } from "./addTab";
import { closeTab } from "./closeTab";
import { closeTabset } from "./closeTabset";
import { collapseTabset } from "./collapseTabset";
import { expandTabset } from "./expandTabset";
import { findTabset } from "./findTabset";
import { hasConflictingIds } from "./hasConflictingIds";
import { insertTab } from "./insertTab";
import { insertTabset } from "./insertTabset";
import { maximizeTabset } from "./maximizeTabset";
import { moveTab } from "./moveTab";
import { moveTabset } from "./moveTabset";
import { normalizeModel } from "./normalizeModel";
import { restoreTabset } from "./restoreTabset";
import { selectTab } from "./selectTab";
import { setSplitLayout } from "./setSplitLayout";
import { updateTab } from "./updateTab";
import { updateRecentTabIds } from "./updateRecentTabIds";
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

  describe("moveTabset", () => {
    const threeTabsets = model(
      split("root", "horizontal", [
        tabset("a", ["1", "2"], 40),
        split(
          "b",
          "vertical",
          [tabset("c", ["3"], 50), tabset("d", ["4"], 50)],
          60
        )
      ])
    );

    test("moves a tabset beside another tabset in the same direction as its split", () => {
      expect(
        shape(
          moveTabset(twoTabsets, "a", { region: "right", tabsetId: "b" }).root
        )
      ).toEqual({
        children: [
          { selected: "3", size: 50, tabs: ["3"] },
          { selected: "1", size: 50, tabs: ["1", "2"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("moves a tabset beside another tabset in the other direction by wrapping it in a split", () => {
      expect(
        shape(
          moveTabset(twoTabsets, "a", { region: "top", tabsetId: "b" }).root
        )
      ).toEqual({
        children: [
          { selected: "1", size: 50, tabs: ["1", "2"] },
          { selected: "3", size: 50, tabs: ["3"] }
        ],
        orientation: "vertical",
        size: undefined
      });
    });

    test("moves a tabset beside a tabset in another split, and its siblings share the space it leaves", () => {
      expect(
        shape(
          moveTabset(threeTabsets, "a", { region: "bottom", tabsetId: "d" })
            .root
        )
      ).toEqual({
        children: [
          { selected: "3", size: 50, tabs: ["3"] },
          { selected: "4", size: 25, tabs: ["4"] },
          { selected: "1", size: 25, tabs: ["1", "2"] }
        ],
        orientation: "vertical",
        size: undefined
      });
    });

    test("keeps the tabset's id, data, and flags when moving it", () => {
      const initial = model(
        split("root", "horizontal", [
          {
            ...tabset("a", ["1", "2"]),
            data: { label: "a" },
            keepWhenEmpty: true,
            minWidth: "100px",
            selectedId: "2",
            tabPlacement: "bottom"
          },
          tabset("b", ["3"])
        ])
      );
      const next = moveTabset(initial, "a", { region: "top", tabsetId: "b" });
      expect((next.root as SplitNode).children[0]).toMatchObject({
        data: { label: "a" },
        id: "a",
        keepWhenEmpty: true,
        minWidth: "100px",
        selectedId: "2",
        tabPlacement: "bottom"
      });
    });

    test("moves its tabs to the end of another tabset, selecting its selected tab", () => {
      const initial = model(
        split("root", "horizontal", [
          { ...tabset("a", ["1", "2"]), selectedId: "2" },
          tabset("b", ["3"])
        ])
      );
      expect(
        shape(
          moveTabset(initial, "a", { region: "center", tabsetId: "b" }).root
        )
      ).toEqual({ selected: "2", size: undefined, tabs: ["3", "1", "2"] });
    });

    test("moves its tabs into another tabset's tab list at an index", () => {
      expect(
        shape(moveTabset(twoTabsets, "b", { index: 1, tabsetId: "a" }).root)
      ).toEqual({ selected: "3", size: undefined, tabs: ["1", "3", "2"] });
    });

    test("keeps a tabset with keepWhenEmpty when its tabs are moved", () => {
      const initial = model(
        split("root", "horizontal", [
          { ...tabset("a", ["1"]), keepWhenEmpty: true },
          tabset("b", ["2"])
        ])
      );
      const next = moveTabset(initial, "a", {
        region: "center",
        tabsetId: "b"
      });
      expect(shape(next.root)).toMatchObject({
        children: [
          { selected: undefined, tabs: [] },
          { selected: "1", tabs: ["2", "1"] }
        ]
      });
    });

    test("returns the same model for targets that wouldn't change it", () => {
      // Onto itself
      expect(
        moveTabset(twoTabsets, "a", { region: "left", tabsetId: "a" })
      ).toBe(twoTabsets);
      // Unknown tabsets
      expect(
        moveTabset(twoTabsets, "x", { region: "left", tabsetId: "a" })
      ).toBe(twoTabsets);
      expect(
        moveTabset(twoTabsets, "a", { region: "left", tabsetId: "x" })
      ).toBe(twoTabsets);
      // Merging a tabset without tabs
      const empty = model(
        split("root", "horizontal", [
          { ...tabset("a", []), keepWhenEmpty: true },
          tabset("b", ["1"])
        ])
      );
      expect(moveTabset(empty, "a", { region: "center", tabsetId: "b" })).toBe(
        empty
      );
    });

    test("moves a tabset without tabs", () => {
      const empty = model(
        split("root", "horizontal", [
          { ...tabset("a", []), keepWhenEmpty: true },
          tabset("b", ["1"])
        ])
      );
      expect(
        shape(moveTabset(empty, "a", { region: "bottom", tabsetId: "b" }).root)
      ).toEqual({
        children: [
          { selected: "1", size: 50, tabs: ["1"] },
          { selected: undefined, size: 50, tabs: [] }
        ],
        orientation: "vertical",
        size: undefined
      });
    });

    test("ends a maximize when the maximized tabset is split", () => {
      const maximized = model(threeTabsets.root, "c");
      expect(
        moveTabset(maximized, "a", { region: "left", tabsetId: "c" })
          .maximizedTabsetId
      ).toBeUndefined();
      expect(
        moveTabset(maximized, "a", { region: "left", tabsetId: "d" })
          .maximizedTabsetId
      ).toBe("c");
    });
  });

  describe("recently selected tabs", () => {
    function withRecent(
      id: string,
      tabIds: string[],
      recentTabIds: string[]
    ): TabsetNode {
      return {
        ...tabset(id, tabIds),
        recentTabIds,
        selectedId: recentTabIds[0]
      };
    }

    test("updateRecentTabIds records each tabset's selected tab as its most recent", () => {
      const initial = model(
        split("root", "horizontal", [
          tabset("a", ["1", "2"]),
          withRecent("b", ["3", "4"], ["4", "3"])
        ])
      );

      const recorded = updateRecentTabIds(initial, "recent");
      expect((recorded.root as SplitNode).children).toMatchObject([
        { recentTabIds: ["1"] },
        { recentTabIds: ["4", "3"] }
      ]);
      // Tabsets whose selected tab is already the most recent aren't copied
      expect((recorded.root as SplitNode).children[1]).toBe(
        (initial.root as SplitNode).children[1]
      );
      expect(updateRecentTabIds(recorded, "recent")).toBe(recorded);

      const selected = updateRecentTabIds(selectTab(recorded, "3"), "recent");
      expect((selected.root as SplitNode).children[1]).toMatchObject({
        recentTabIds: ["3", "4"]
      });
    });

    test("updateRecentTabIds removes recently selected tabs for the adjacent behavior", () => {
      const initial = model(withRecent("a", ["1", "2"], ["2", "1"]));

      const next = updateRecentTabIds(initial, "adjacent");
      expect(next.root).not.toHaveProperty("recentTabIds");
      expect(updateRecentTabIds(next, "adjacent")).toBe(next);
    });

    test("closing the selected tab selects the most recently selected tab", () => {
      const initial = model(withRecent("a", ["1", "2", "3"], ["2", "1"]));

      expect(closeTab(initial, "2").root).toMatchObject({
        recentTabIds: ["1"],
        selectedId: "1"
      });
    });

    test("closing the selected tab selects the adjacent tab if no other tab has been selected", () => {
      const initial = model(withRecent("a", ["1", "2", "3"], ["2"]));

      expect(closeTab(initial, "2").root).toMatchObject({ selectedId: "3" });
      expect(initial.root).toMatchObject({ selectedId: "2" });
    });

    test("closing another tab doesn't change the selection, but forgets the tab", () => {
      const initial = model(withRecent("a", ["1", "2", "3"], ["2", "3", "1"]));

      expect(closeTab(initial, "3").root).toMatchObject({
        recentTabIds: ["2", "1"],
        selectedId: "2"
      });
    });

    test("dragging the selected tab away selects the most recently selected tab", () => {
      const initial = model(
        split("root", "horizontal", [
          withRecent("a", ["1", "2", "3"], ["2", "1"]),
          withRecent("b", ["4"], ["4"])
        ])
      );

      const next = moveTab(initial, "2", { region: "center", tabsetId: "b" });
      expect((next.root as SplitNode).children).toMatchObject([
        { recentTabIds: ["1"], selectedId: "1" },
        { recentTabIds: ["4"], selectedId: "2" }
      ]);
    });

    test("merging a tabset keeps both tabsets' recently selected tabs, the destination's first", () => {
      const initial = model(
        split("root", "horizontal", [
          withRecent("a", ["1", "2"], ["2", "1"]),
          withRecent("b", ["3", "4"], ["4", "3"])
        ])
      );

      const next = moveTabset(initial, "a", {
        region: "center",
        tabsetId: "b"
      });
      expect(next.root).toMatchObject({
        recentTabIds: ["4", "3", "2", "1"],
        selectedId: "2"
      });
      expect(
        updateRecentTabIds(next, "recent").root as TabsetNode
      ).toMatchObject({ recentTabIds: ["2", "4", "3", "1"] });
    });

    test("normalizeModel forgets removed, duplicate, and invalid ids", () => {
      expect(
        normalizeModel(
          model({
            ...tabset("a", ["1", "2"]),
            recentTabIds: ["2", "x", "2", "1"]
          })
        ).root
      ).toMatchObject({ recentTabIds: ["2", "1"] });

      for (const recentTabIds of [[], ["x"], "1", null]) {
        expect(
          normalizeModel(
            model({
              ...tabset("a", ["1"]),
              recentTabIds: recentTabIds as string[]
            })
          ).root
        ).not.toHaveProperty("recentTabIds");
      }
    });
  });

  describe("collapsing tabsets", () => {
    function collapsible(
      id: string,
      size: number,
      collapsed = false
    ): TabsetNode {
      return {
        ...tabset(id, [`${id}-tab`], size),
        collapsible: true,
        ...(collapsed && { collapsed: true })
      };
    }

    function sizes(next: WorkspaceModel) {
      return (next.root as SplitNode).children.map(
        (child) =>
          `${child.id}:${Math.round(child.size as number)}${
            child.type === "tabset" && child.collapsed ? " (collapsed)" : ""
          }`
      );
    }

    test("collapsing keeps the tabset's size, and its siblings fill the split", () => {
      const initial = model(
        split("root", "vertical", [
          tabset("a", ["1"], 40),
          tabset("b", ["2"], 30),
          collapsible("c", 30)
        ])
      );

      const collapsed = collapseTabset(initial, "c");
      expect(sizes(collapsed)).toEqual(["a:57", "b:43", "c:30 (collapsed)"]);

      // Expanding restores its size, and its siblings shrink proportionally
      expect(sizes(expandTabset(collapsed, "c"))).toEqual([
        "a:40",
        "b:30",
        "c:30"
      ]);
    });

    test("dropping tabs into a collapsed tabset expands it", () => {
      const initial = model(
        split("root", "vertical", [
          tabset("a", ["1", "2"], 70),
          collapsible("b", 30, true)
        ])
      );

      const movedTab = moveTab(initial, "2", { index: 0, tabsetId: "b" });
      expect(sizes(movedTab)).toEqual(["a:70", "b:30"]);
      expect(findTabset(movedTab, "b")?.selectedId).toBe("2");

      const movedTabset = moveTabset(
        model(
          split("root", "vertical", [
            tabset("a", ["1"], 40),
            tabset("c", ["3"], 30),
            collapsible("b", 30, true)
          ])
        ),
        "c",
        { region: "center", tabsetId: "b" }
      );
      expect(sizes(movedTabset)).toEqual(["a:70", "b:30"]);
      expect(findTabset(movedTabset, "b")?.selectedId).toBe("3");
    });

    test("a collapsed tabset moved beside another tabset is expanded", () => {
      const moved = moveTabset(
        model(
          split("root", "vertical", [
            tabset("a", ["1"], 50),
            tabset("c", ["3"], 30),
            collapsible("b", 20, true)
          ])
        ),
        "b",
        { region: "right", tabsetId: "a" }
      );

      expect(findTabset(moved, "b")?.collapsed).toBeUndefined();
      expect(
        ((moved.root as SplitNode).children[0] as SplitNode).children.map(
          ({ id }) => id
        )
      ).toEqual(["a", "b"]);
    });

    test("reordering the tabs of a collapsed tabset leaves it collapsed", () => {
      const initial = model(
        split("root", "vertical", [
          tabset("a", ["1"], 70),
          { ...collapsible("b", 30, true), tabs: [tab("2"), tab("3")] }
        ])
      );

      const reordered = moveTab(initial, "3", { index: 0, tabsetId: "b" });
      expect(findTabset(reordered, "b")?.tabs.map(({ id }) => id)).toEqual([
        "3",
        "2"
      ]);
      expect(sizes(reordered)).toEqual(["a:100", "b:30 (collapsed)"]);
    });

    test("tabsets can only be collapsed if they're collapsible and a sibling stays expanded", () => {
      const initial = model(
        split("root", "vertical", [
          tabset("a", ["1"], 50),
          collapsible("b", 50)
        ])
      );
      expect(collapseTabset(initial, "a")).toBe(initial);

      const collapsed = collapseTabset(initial, "b");
      expect(collapsed).not.toBe(initial);
      expect(collapseTabset(collapsed, "b")).toBe(collapsed);

      const bothCollapsible = model(
        split("root", "vertical", [
          collapsible("a", 50),
          collapsible("b", 50, true)
        ])
      );
      expect(collapseTabset(bothCollapsible, "a")).toBe(bothCollapsible);

      // The root tabset fills the workspace
      const root = model({ ...collapsible("a", 100) });
      expect(collapseTabset(root, "a")).toBe(root);
    });

    test("expanding a tabset that isn't collapsed does nothing", () => {
      const initial = model(
        split("root", "vertical", [
          tabset("a", ["1"], 50),
          collapsible("b", 50)
        ])
      );
      expect(expandTabset(initial, "b")).toBe(initial);
    });

    test("normalizeModel expands tabsets that can't be collapsed", () => {
      // Not collapsible
      expect(
        (
          normalizeModel(
            model(
              split("root", "vertical", [
                tabset("a", ["1"], 50),
                { ...tabset("b", ["2"], 50), collapsed: true }
              ])
            )
          ).root as SplitNode
        ).children[1]
      ).not.toHaveProperty("collapsed");

      // Every child of a split collapsed
      const allCollapsed = normalizeModel(
        model(
          split("root", "vertical", [
            collapsible("a", 50, true),
            collapsible("b", 50, true)
          ])
        )
      );
      expect(sizes(allCollapsed)).toEqual(["a:50 (collapsed)", "b:100"]);

      // The root tabset (e.g. after its siblings are closed)
      const root = closeTab(
        model(
          split("root", "vertical", [
            tabset("a", ["1"], 50),
            collapsible("b", 50, true)
          ])
        ),
        "1"
      );
      expect(root.root).toMatchObject({ id: "b" });
      expect(root.root).not.toHaveProperty("collapsed");
    });

    test("resizing can collapse and expand tabsets", () => {
      const initial = model(
        split("root", "vertical", [
          tabset("a", ["1"], 70),
          collapsible("b", 30)
        ])
      );

      const collapsed = setSplitLayout(
        initial,
        "root",
        { a: 95, b: 5 },
        new Set(["b"])
      );
      expect(sizes(collapsed)).toEqual(["a:100", "b:30 (collapsed)"]);

      const expanded = setSplitLayout(
        collapsed,
        "root",
        { a: 60, b: 40 },
        new Set()
      );
      expect(sizes(expanded)).toEqual(["a:60", "b:40"]);
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

  test("setSplitLayout ignores layouts measured for other children (e.g. before the model was replaced)", () => {
    const collapsed = model(
      split("root", "horizontal", [
        tabset("a", ["1"], 30),
        tabset("b", ["2"], 70),
        { ...tabset("c", ["3"], 20), collapsed: true, collapsible: true }
      ])
    );

    // Measured for two of the split's children
    expect(setSplitLayout(collapsed, "root", { a: 30, b: 70 }, new Set())).toBe(
      collapsed
    );
    // Measured for different children
    expect(
      setSplitLayout(collapsed, "root", { a: 30, b: 60, d: 10 }, new Set())
    ).toBe(collapsed);
  });

  test("setSplitLayout keeps the sizes and collapsed flags of unchanged children (e.g. tabsets collapsed to fit)", () => {
    const initial = model(
      split("root", "horizontal", [
        { ...tabset("a", ["1"], 25), collapsible: true },
        tabset("b", ["2"], 25),
        tabset("c", ["3"], 50)
      ])
    );

    // "a" is shown at its collapsed size, but it was collapsed to fit (not by the resize)
    const next = setSplitLayout(
      initial,
      "root",
      { a: 5, b: 30, c: 65 },
      new Set(),
      new Set(["a"])
    );
    const children = (next.root as SplitNode).children as TabsetNode[];
    expect(children[0].collapsed).toBeUndefined();
    // "a" keeps its size; the others are scaled with it to fill the split
    const sizes = children.map(({ size }) => size as number);
    expect(sizes[0]).toBeCloseTo(20.833);
    expect(sizes[1]).toBeCloseTo(25);
    expect(sizes[2]).toBeCloseTo(54.167);
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

  describe("insertTab", () => {
    test("inserts a tab into a tabset's list and selects it", () => {
      const next = insertTab(twoTabsets, tab("9"), { index: 1, tabsetId: "a" });
      expect(shape(next.root)).toEqual({
        children: [
          { selected: "9", size: 40, tabs: ["1", "9", "2"] },
          { selected: "3", size: 60, tabs: ["3"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("inserts a tab into a new tabset beside the target", () => {
      expect(
        shape(
          insertTab(twoTabsets, tab("9"), { region: "right", tabsetId: "b" })
            .root
        )
      ).toEqual({
        children: [
          { selected: "1", size: 40, tabs: ["1", "2"] },
          { selected: "3", size: 30, tabs: ["3"] },
          { selected: "9", size: 30, tabs: ["9"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("expands a collapsed tabset that a tab is dropped into", () => {
      const collapsed = model(
        split("root", "vertical", [
          tabset("a", ["1"]),
          { ...tabset("b", ["2"]), collapsed: true }
        ])
      );

      const next = insertTab(collapsed, tab("9"), {
        region: "center",
        tabsetId: "b"
      });
      expect(findTabset(next, "b")).not.toHaveProperty("collapsed");
    });

    test("keeps an empty root tabset that a tab is dropped into", () => {
      const empty = model({ ...tabset("a", []), data: "data" });

      const next = insertTab(empty, tab("9"), {
        region: "center",
        tabsetId: "a"
      });
      expect(next.root).toMatchObject({
        data: "data",
        id: "a",
        selectedId: "9"
      });
    });

    test("returns the same model when the target tabset doesn't exist", () => {
      expect(
        insertTab(twoTabsets, tab("9"), { region: "center", tabsetId: "x" })
      ).toBe(twoTabsets);
    });
  });

  describe("insertTabset", () => {
    test("inserts a tabset's tabs into a tabset's list, keeping its selected tab", () => {
      const inserted = { ...tabset("x", ["8", "9"]), selectedId: "9" };
      expect(
        shape(
          insertTabset(twoTabsets, inserted, { index: 0, tabsetId: "b" }).root
        )
      ).toEqual({
        children: [
          { selected: "1", size: 40, tabs: ["1", "2"] },
          { selected: "9", size: 60, tabs: ["8", "9", "3"] }
        ],
        orientation: "horizontal",
        size: undefined
      });
    });

    test("inserts a whole tabset (with its id and flags, but not its size) beside the target", () => {
      const inserted = {
        ...tabset("x", ["9"], 25),
        collapsed: true,
        data: { kind: "tools" },
        keepWhenEmpty: false
      };
      const next = insertTabset(twoTabsets, inserted, {
        region: "bottom",
        tabsetId: "b"
      });

      expect(findTabset(next, "x")).toEqual({
        data: { kind: "tools" },
        id: "x",
        keepWhenEmpty: false,
        selectedId: "9",
        size: 50,
        tabs: [tab("9")],
        type: "tabset"
      });
      expect(inserted.collapsed).toBe(true);
    });

    test("keeps an empty root tabset that a tabset is dropped into", () => {
      const empty = model({ ...tabset("a", []), data: "data" });

      const next = insertTabset(empty, tabset("x", ["8", "9"]), {
        region: "center",
        tabsetId: "a"
      });
      expect(next.root).toMatchObject({
        data: "data",
        id: "a",
        selectedId: "8",
        tabs: [tab("8"), tab("9")]
      });
    });

    test("returns the same model when an empty tabset's tabs would be inserted", () => {
      expect(
        insertTabset(twoTabsets, tabset("x", []), {
          region: "center",
          tabsetId: "b"
        })
      ).toBe(twoTabsets);
    });
  });

  describe("hasConflictingIds", () => {
    test("detects tabs with the same ids", () => {
      const target = { region: "center", tabsetId: "b" } as const;
      expect(
        hasConflictingIds(twoTabsets, { tab: tab("1"), type: "tab" }, target)
      ).toBe(true);
      expect(
        hasConflictingIds(twoTabsets, { tab: tab("9"), type: "tab" }, target)
      ).toBe(false);
      expect(
        hasConflictingIds(
          twoTabsets,
          { tabset: tabset("x", ["9", "3"]), type: "tabset" },
          target
        )
      ).toBe(true);
    });

    test("compares ids across tabs, tabsets, and splits", () => {
      const target = { region: "center", tabsetId: "b" } as const;
      expect(
        hasConflictingIds(twoTabsets, { tab: tab("a"), type: "tab" }, target)
      ).toBe(true);
      expect(
        hasConflictingIds(twoTabsets, { tab: tab("root"), type: "tab" }, target)
      ).toBe(true);
      expect(
        hasConflictingIds(
          twoTabsets,
          { tabset: tabset("x", ["root"]), type: "tabset" },
          target
        )
      ).toBe(true);
      expect(
        hasConflictingIds(
          twoTabsets,
          { tabset: tabset("3", ["9"]), type: "tabset" },
          { region: "left", tabsetId: "b" }
        )
      ).toBe(true);
      expect(
        hasConflictingIds(
          twoTabsets,
          { tabset: tabset("3", ["9"]), type: "tabset" },
          target
        )
      ).toBe(false);
    });

    test("only compares a tabset's own id where it's inserted whole", () => {
      const node = { tabset: tabset("a", ["9"]), type: "tabset" } as const;
      expect(
        hasConflictingIds(twoTabsets, node, { index: 0, tabsetId: "b" })
      ).toBe(false);
      expect(
        hasConflictingIds(twoTabsets, node, { region: "center", tabsetId: "b" })
      ).toBe(false);
      expect(
        hasConflictingIds(twoTabsets, node, { region: "left", tabsetId: "b" })
      ).toBe(true);
    });
  });
});
