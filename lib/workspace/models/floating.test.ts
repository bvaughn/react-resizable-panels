import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { addTab } from "./addTab";
import { closeTab } from "./closeTab";
import { closeTabset } from "./closeTabset";
import { collapseTabset } from "./collapseTabset";
import { createTearOffModel } from "./createTearOffModel";
import { floatTab } from "./floatTab";
import { floatTabset } from "./floatTabset";
import { getModelIndex } from "./getModelIndex";
import { hasConflictingIds } from "./hasConflictingIds";
import { insertTab } from "./insertTab";
import { maximizeTabset } from "./maximizeTabset";
import { moveTab } from "./moveTab";
import { moveTabset } from "./moveTabset";
import { normalizeModel } from "./normalizeModel";
import { normalizeWorkspaceModel } from "./normalizeWorkspaceModel";
import { raiseFloatingTabset } from "./raiseFloatingTabset";
import { selectTab } from "./selectTab";
import { updateRecentTabIds } from "./updateRecentTabIds";
import { updateTabset } from "./updateTabset";
import type {
  FloatingTabsetNode,
  TabNode,
  TabsetNode,
  WorkspaceModel
} from "../types";

function tab(id: string): TabNode {
  return { data: { id }, id };
}

function tabset(id: string, tabIds: string[], size?: number): TabsetNode {
  return {
    id,
    selectedId: tabIds[0],
    size,
    tabs: tabIds.map(tab),
    type: "tabset"
  };
}

const rect = { height: 200, width: 300, x: 10, y: 20 };

function floating(id: string, tabIds: string[]): FloatingTabsetNode {
  return {
    ...rect,
    id,
    selectedId: tabIds[0],
    tabs: tabIds.map(tab),
    type: "tabset"
  };
}

// Two tabsets side by side ("a" and "b"), and a floating tabset ("f")
function createModel(): WorkspaceModel {
  return normalizeModel({
    floating: [floating("f", ["f1", "f2"])],
    root: {
      children: [tabset("a", ["a1", "a2"], 50), tabset("b", ["b1"], 50)],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1
  });
}

describe("floating tabsets", () => {
  beforeEach(() => {
    resetWarnOnceForTest();
  });

  describe("normalizeModel", () => {
    test("leaves out the field when there are no floating tabsets", () => {
      const model = normalizeModel({
        floating: [],
        root: tabset("a", ["a1"]),
        version: 1
      });

      expect("floating" in model).toBe(false);
    });

    test("removes empty floating tabsets, unless they're kept when empty", () => {
      const model = normalizeModel({
        floating: [
          floating("empty", []),
          { ...floating("kept", []), keepWhenEmpty: true }
        ],
        root: tabset("a", ["a1"]),
        version: 1
      });

      expect(model.floating?.map(({ id }) => id)).toEqual(["kept"]);
    });

    test("removes fields that only apply within the layout", () => {
      const model = normalizeModel({
        floating: [
          {
            ...floating("f", ["f1"]),
            collapsed: true,
            collapsible: true,
            size: 50
          } as FloatingTabsetNode
        ],
        root: tabset("a", ["a1"]),
        version: 1
      });

      expect(model.floating?.[0]).toEqual(floating("f", ["f1"]));
    });

    test("fixes invalid positions and sizes", () => {
      const model = normalizeModel({
        floating: [
          {
            ...floating("f", ["f1"]),
            height: -1,
            width: Number.NaN,
            x: -50,
            y: "10" as unknown as number
          }
        ],
        root: tabset("a", ["a1"]),
        version: 1
      });

      expect(model.floating?.[0]).toMatchObject({
        height: 240,
        width: 320,
        // Negative positions are allowed (e.g. a tabset dragged partly off of the left edge)
        x: -50,
        y: 0
      });
    });

    test("fixes floating tabsets' selections", () => {
      const model = normalizeModel({
        floating: [{ ...floating("f", ["f1", "f2"]), selectedId: "missing" }],
        root: tabset("a", ["a1"]),
        version: 1
      });

      expect(model.floating?.[0].selectedId).toBe("f1");
    });

    test("assigns ids to floating tabsets that don't have them, avoiding ids that are already used", () => {
      const model = normalizeModel({
        floating: [
          { ...floating("f", ["f1"]), id: undefined },
          { ...floating("f", ["f2"]), id: undefined }
        ],
        root: tabset("floating-1", ["a1"]),
        version: 1
      });

      expect(model.floating?.map(({ id }) => id)).toEqual([
        "floating-0",
        "floating-1-2"
      ]);
    });

    test("warns about ids that are used in the layout and by floating tabsets", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      normalizeModel({
        floating: [floating("a", ["f1"])],
        root: tabset("a", ["a1"]),
        version: 1
      });

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate id found in workspace model: "a"')
      );
      warn.mockRestore();
    });

    test("clears a maximized tabset that's floating", () => {
      const model = normalizeModel({
        ...createModel(),
        maximizedTabsetId: "f"
      });

      expect(model.maximizedTabsetId).toBeUndefined();
    });

    test("keeps floating tabsets when the layout is emptied", () => {
      const model = closeTabset(closeTabset(createModel(), "a"), "b");

      expect(model.root).toMatchObject({ tabs: [], type: "tabset" });
      expect(model.floating?.map(({ id }) => id)).toEqual(["f"]);
    });
  });

  describe("normalizeWorkspaceModel", () => {
    test("rejects floating tabsets that aren't tabsets", () => {
      expect(
        normalizeWorkspaceModel({
          floating: [{ id: "f" }],
          root: tabset("a", ["a1"]),
          version: 1
        })
      ).toBeNull();
      expect(
        normalizeWorkspaceModel({
          floating: "f",
          root: tabset("a", ["a1"]),
          version: 1
        })
      ).toBeNull();
    });

    test("maps floating tabsets' tabs", () => {
      const model = normalizeWorkspaceModel(createModel(), {
        mapTab: (tab) => (tab.id === "f1" ? null : { ...tab, title: "Mapped" })
      });

      expect(model?.floating?.[0].tabs).toEqual([
        { ...tab("f2"), title: "Mapped" }
      ]);
    });
  });

  describe("indexing", () => {
    test("indexes floating tabsets and their tabs", () => {
      const index = getModelIndex(createModel());

      expect(index.floatingTabsetIds).toEqual(new Set(["f"]));
      expect(index.tabsetsById.get("f")?.id).toBe("f");
      expect(index.tabsetsByTabId.get("f2")?.id).toBe("f");
      expect(index.nodeIds.has("f")).toBe(true);
      expect(index.parentsById.has("f")).toBe(false);
    });
  });

  describe("floatTabset", () => {
    test("moves a tabset out of the layout, on top of the other floating tabsets", () => {
      const model = floatTabset(createModel(), "b", rect);

      expect(model.root).toMatchObject({ id: "a", type: "tabset" });
      expect(model.floating).toEqual([
        floating("f", ["f1", "f2"]),
        { ...tabset("b", ["b1"]), ...rect, size: undefined }
      ]);
      expect(model.floating?.[1]).not.toHaveProperty("size");
    });

    test("keeps the tabset's id, data, and flags, but not its layout fields", () => {
      const prev = normalizeModel({
        root: {
          children: [
            tabset("a", ["a1"], 50),
            {
              ...tabset("b", ["b1"], 50),
              collapsed: true,
              collapsible: true,
              data: { kind: "notes" },
              keepWhenEmpty: true
            }
          ],
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      });

      expect(floatTabset(prev, "b", rect).floating?.[0]).toEqual({
        ...rect,
        data: { kind: "notes" },
        id: "b",
        keepWhenEmpty: true,
        selectedId: "b1",
        tabs: [tab("b1")],
        type: "tabset"
      });
    });

    test("doesn't float the root tabset, or a tabset that's already floating", () => {
      const prev = createModel();
      expect(floatTabset(prev, "f", rect)).toBe(prev);

      const single = normalizeModel({ root: tabset("a", ["a1"]), version: 1 });
      expect(floatTabset(single, "a", rect)).toBe(single);
    });

    test("restores a maximized tabset first", () => {
      const prev = maximizeTabset(createModel(), "b");

      expect(floatTabset(prev, "b", rect).maximizedTabsetId).toBeUndefined();
    });
  });

  describe("floatTab", () => {
    test("moves a tab into a new floating tabset, on top of the other floating tabsets", () => {
      const model = floatTab(createModel(), "a2", rect);

      expect(model.floating).toHaveLength(2);
      expect(model.floating?.[1]).toMatchObject({
        ...rect,
        selectedId: "a2",
        tabs: [tab("a2")]
      });
      expect(model.floating?.[1]).not.toHaveProperty("size");
      expect(getModelIndex(model).tabsetsById.get("a")?.tabs).toEqual([
        tab("a1")
      ]);
    });

    test("removes a tabset that's emptied (unless it's kept when empty)", () => {
      const model = floatTab(createModel(), "b1", rect);

      expect(model.root).toMatchObject({ id: "a", type: "tabset" });
    });

    test("moves a tab out of a floating tabset with other tabs", () => {
      const model = floatTab(createModel(), "f2", rect);

      expect(
        model.floating?.map(({ tabs }) => tabs.map(({ id }) => id))
      ).toEqual([["f1"], ["f2"]]);
    });

    test("leaves the only tab of a floating tabset where it is", () => {
      const prev = floatTab(createModel(), "f2", rect);

      expect(floatTab(prev, "f2", rect)).toBe(prev);
    });

    test("ignores tabs that don't exist", () => {
      const prev = createModel();

      expect(floatTab(prev, "missing", rect)).toBe(prev);
    });
  });

  describe("raiseFloatingTabset", () => {
    test("moves a floating tabset to the end of the list", () => {
      const prev = floatTabset(createModel(), "b", rect);
      const model = raiseFloatingTabset(prev, "f");

      expect(model.floating?.map(({ id }) => id)).toEqual(["b", "f"]);
      // Only the order changes
      expect(model.floating?.[1]).toBe(prev.floating?.[0]);
    });

    test("leaves the model unchanged for the front tabset, or a tabset that isn't floating", () => {
      const prev = floatTabset(createModel(), "b", rect);

      expect(raiseFloatingTabset(prev, "b")).toBe(prev);
      expect(raiseFloatingTabset(prev, "a")).toBe(prev);
    });
  });

  describe("moving tabs into and out of floating tabsets", () => {
    test("docks a tab dragged out of a floating tabset", () => {
      const model = moveTab(createModel(), "f2", { index: 0, tabsetId: "a" });

      expect(getModelIndex(model).tabsetsByTabId.get("f2")?.id).toBe("a");
      expect(model.floating?.[0].tabs).toEqual([tab("f1")]);
    });

    test("removes a floating tabset when its last tab is dragged out", () => {
      const prev = floatTab(createModel(), "a2", rect);
      const floatingId = prev.floating?.[1].id ?? "";

      const model = moveTab(prev, "a2", { region: "right", tabsetId: "b" });

      expect(model.floating?.map(({ id }) => id)).toEqual(["f"]);
      expect(getModelIndex(model).tabsetsById.has(floatingId)).toBe(false);
    });

    test("adds a tab dropped onto a floating tabset", () => {
      const model = moveTab(createModel(), "a1", {
        region: "center",
        tabsetId: "f"
      });

      expect(model.floating?.[0]).toMatchObject({
        ...rect,
        selectedId: "a1",
        tabs: [tab("f1"), tab("f2"), tab("a1")]
      });
    });

    test("adds a tab dropped onto an edge region of a floating tabset, rather than splitting it", () => {
      const model = moveTab(createModel(), "a1", {
        region: "left",
        tabsetId: "f"
      });

      expect(model.floating).toHaveLength(1);
      expect(model.floating?.[0].tabs.map(({ id }) => id)).toEqual([
        "f1",
        "f2",
        "a1"
      ]);
    });

    test("docks a tab moved to an edge of the workspace", () => {
      const model = moveTab(createModel(), "f2", { edge: "bottom" });

      expect(model.root).toMatchObject({ orientation: "vertical" });
      expect(model.floating?.[0].tabs).toEqual([tab("f1")]);
    });

    test("adds tabs dropped in from another workspace to a floating tabset", () => {
      const model = insertTab(createModel(), tab("x"), {
        region: "top",
        tabsetId: "f"
      });

      expect(model.floating?.[0].tabs.map(({ id }) => id)).toEqual([
        "f1",
        "f2",
        "x"
      ]);
    });

    test("selects, closes, and adds tabs in floating tabsets", () => {
      let model = selectTab(createModel(), "f2");
      expect(model.floating?.[0].selectedId).toBe("f2");

      model = addTab(model, tab("f3"), { tabsetId: "f" }).model;
      expect(model.floating?.[0].tabs.map(({ id }) => id)).toEqual([
        "f1",
        "f2",
        "f3"
      ]);

      model = closeTab(closeTab(closeTab(model, "f1"), "f2"), "f3");
      expect(model.floating).toBeUndefined();
    });
  });

  describe("moving floating tabsets", () => {
    test("docks a floating tabset moved beside another tabset", () => {
      const model = moveTabset(createModel(), "f", {
        region: "bottom",
        tabsetId: "a"
      });

      expect(model.floating).toBeUndefined();
      const docked = getModelIndex(model).tabsetsById.get("f");
      expect(docked).toEqual({
        id: "f",
        selectedId: "f1",
        size: 50,
        tabs: [tab("f1"), tab("f2")],
        type: "tabset"
      });
    });

    test("docks a floating tabset moved to an edge of the workspace", () => {
      const model = moveTabset(createModel(), "f", { edge: "left" });

      expect(model.floating).toBeUndefined();
      expect(model.root).toMatchObject({
        children: [{ id: "f" }, { id: "a" }, { id: "b" }],
        orientation: "horizontal"
      });
      expect(getModelIndex(model).tabsetsById.get("f")).not.toHaveProperty("x");
    });

    test("moves a floating tabset's tabs into another tabset", () => {
      const model = moveTabset(createModel(), "f", {
        region: "center",
        tabsetId: "b"
      });

      expect(model.floating).toBeUndefined();
      expect(getModelIndex(model).tabsetsById.get("b")?.tabs).toEqual([
        tab("b1"),
        tab("f1"),
        tab("f2")
      ]);
    });

    test("moves a tabset's tabs into a floating tabset, rather than splitting it", () => {
      const model = moveTabset(createModel(), "b", {
        region: "right",
        tabsetId: "f"
      });

      expect(model.root).toMatchObject({ id: "a", type: "tabset" });
      expect(model.floating?.[0].tabs.map(({ id }) => id)).toEqual([
        "f1",
        "f2",
        "b1"
      ]);
    });
  });

  describe("other operations", () => {
    test("doesn't maximize or collapse floating tabsets", () => {
      const prev = createModel();

      expect(maximizeTabset(prev, "f")).toBe(prev);
      expect(collapseTabset(prev, "f")).toBe(prev);
    });

    test("closes floating tabsets", () => {
      expect(closeTabset(createModel(), "f").floating).toBeUndefined();
    });

    test("updates floating tabsets' positions and sizes", () => {
      const model = updateTabset(createModel(), "f", {
        height: 150,
        width: 250,
        x: 5,
        y: 6
      });

      expect(model.floating?.[0]).toMatchObject({
        height: 150,
        width: 250,
        x: 5,
        y: 6
      });
    });

    test("ignores positions and sizes for tabsets in the layout", () => {
      const model = updateTabset(createModel(), "a", { x: 5 });

      expect(getModelIndex(model).tabsetsById.get("a")).not.toHaveProperty("x");
    });

    test("ignores collapsible flags for floating tabsets", () => {
      const model = updateTabset(createModel(), "f", { collapsible: true });

      expect(model.floating?.[0]).not.toHaveProperty("collapsible");
    });

    test("records floating tabsets' recently selected tabs", () => {
      const model = updateRecentTabIds(
        selectTab(createModel(), "f2"),
        "recent"
      );

      expect(model.floating?.[0].recentTabIds).toEqual(["f2"]);
      expect(updateRecentTabIds(model, "recent")).toBe(model);
    });

    test("tears off floating tabsets without their positions and sizes", () => {
      expect(
        createTearOffModel(createModel(), { tabsetId: "f", type: "tabset" })
          ?.root
      ).toEqual({
        id: "f",
        selectedId: "f1",
        tabs: [tab("f1"), tab("f2")],
        type: "tabset"
      });
    });

    test("rejects tabs dropped in from another workspace with the same ids as floating tabsets' tabs", () => {
      expect(
        hasConflictingIds(
          createModel(),
          { tab: tab("f1"), type: "tab" },
          { region: "center", tabsetId: "a" }
        )
      ).toBe(true);
    });
  });
});
