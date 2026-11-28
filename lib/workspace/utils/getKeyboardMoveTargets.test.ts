import { describe, expect, test } from "vitest";
import type { TabNode, TabsetNode, WorkspaceModel } from "../types";
import { getKeyboardMoveTargets } from "./getKeyboardMoveTargets";

function tabset(
  id: string,
  tabIds: string[],
  extra: Partial<TabsetNode> = {}
): TabsetNode {
  return {
    id,
    selectedId: tabIds[0],
    tabs: tabIds.map((tabId): TabNode => ({ data: undefined, id: tabId })),
    type: "tabset",
    ...extra
  };
}

function createModel(extra: Partial<WorkspaceModel> = {}): WorkspaceModel {
  return {
    root: {
      children: [tabset("a", ["1", "2"]), tabset("b", ["3"])],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1,
    ...extra
  };
}

function getTargets(
  model: WorkspaceModel,
  tabId: string,
  {
    collapsedIds = [],
    isRightToLeft = false
  }: { collapsedIds?: string[]; isRightToLeft?: boolean } = {}
) {
  return getKeyboardMoveTargets({
    isCollapsed: (tabset) =>
      collapsedIds.includes(tabset.id) || !!tabset.collapsed,
    isRightToLeft,
    model,
    tabId
  });
}

const SIDES = ["left", "right", "top", "bottom"] as const;

describe("getKeyboardMoveTargets", () => {
  test("other tabsets (center and sides), the sides of the tab's own tabset, and the edges of the workspace", () => {
    expect(getTargets(createModel(), "2")).toEqual([
      ...SIDES.map((region) => ({ region, tabsetId: "a" })),
      { region: "center", tabsetId: "b" },
      ...SIDES.map((region) => ({ region, tabsetId: "b" })),
      ...SIDES.map((edge) => ({ edge }))
    ]);
  });

  test("the only tab of a tabset can't split it, or move to an edge that the tabset already fills", () => {
    expect(getTargets(createModel(), "3")).toEqual([
      { region: "center", tabsetId: "a" },
      ...SIDES.map((region) => ({ region, tabsetId: "a" })),
      { edge: "left" },
      { edge: "top" },
      { edge: "bottom" }
    ]);
  });

  test("edges are sides of the screen, so the edge a tabset fills is swapped in right-to-left layouts", () => {
    expect(
      getTargets(createModel(), "3", { isRightToLeft: true }).filter(
        (target) => "edge" in target
      )
    ).toEqual([{ edge: "right" }, { edge: "top" }, { edge: "bottom" }]);
  });

  test("the only tab of a tabset that's kept when empty can split it, and move to any edge", () => {
    const model = createModel();
    if (model.root.type === "split") {
      model.root.children[1] = tabset("b", ["3"], { keepWhenEmpty: true });
    }

    const targets = getTargets(model, "3");
    expect(targets).toEqual(
      expect.arrayContaining([
        ...SIDES.map((region) => ({ region, tabsetId: "b" })),
        ...SIDES.map((edge) => ({ edge }))
      ])
    );
    expect(targets).not.toContainEqual({ region: "center", tabsetId: "b" });
  });

  test("collapsed tabsets are targeted at the end of their tab lists, and not at all if the tab is in them", () => {
    const model = createModel();

    expect(getTargets(model, "1", { collapsedIds: ["b"] })).toEqual([
      ...SIDES.map((region) => ({ region, tabsetId: "a" })),
      { index: 1, tabsetId: "b" },
      ...SIDES.map((edge) => ({ edge }))
    ]);
    expect(
      getTargets(model, "1", { collapsedIds: ["a"] }).filter(
        (target) => "tabsetId" in target && target.tabsetId === "a"
      )
    ).toEqual([]);
  });

  test("floating tabsets are only targeted at their centers, after the layout's tabsets", () => {
    const model = createModel({
      floating: [{ ...tabset("f", ["4"]), height: 100, width: 100, x: 0, y: 0 }]
    });

    const targets = getTargets(model, "1");
    expect(targets.filter((target) => "tabsetId" in target)).toEqual([
      ...SIDES.map((region) => ({ region, tabsetId: "a" })),
      { region: "center", tabsetId: "b" },
      ...SIDES.map((region) => ({ region, tabsetId: "b" })),
      { region: "center", tabsetId: "f" }
    ]);

    // A floating tabset's only tab can be moved anywhere in the layout
    expect(getTargets(model, "4")).toEqual([
      { region: "center", tabsetId: "a" },
      ...SIDES.map((region) => ({ region, tabsetId: "a" })),
      { region: "center", tabsetId: "b" },
      ...SIDES.map((region) => ({ region, tabsetId: "b" })),
      ...SIDES.map((edge) => ({ edge }))
    ]);
  });

  test("while a tabset is maximized, only it and floating tabsets are targeted (and not the edges of the workspace)", () => {
    const model = createModel({
      floating: [
        { ...tabset("f", ["4"]), height: 100, width: 100, x: 0, y: 0 }
      ],
      maximizedTabsetId: "b"
    });

    expect(getTargets(model, "1")).toEqual([
      { region: "center", tabsetId: "b" },
      ...SIDES.map((region) => ({ region, tabsetId: "b" })),
      { region: "center", tabsetId: "f" }
    ]);

    // A maximized tabset is shown expanded, even if it's collapsed in the model
    expect(getTargets(model, "1", { collapsedIds: ["b"] })[0]).toEqual({
      region: "center",
      tabsetId: "b"
    });
  });

  test("empty tabsets kept when empty can be targeted at their centers and sides", () => {
    const model = createModel();
    if (model.root.type === "split") {
      model.root.children[1] = tabset("b", [], { keepWhenEmpty: true });
    }

    expect(
      getTargets(model, "1").filter(
        (target) => "tabsetId" in target && target.tabsetId === "b"
      )
    ).toEqual([
      { region: "center", tabsetId: "b" },
      ...SIDES.map((region) => ({ region, tabsetId: "b" }))
    ]);
  });

  test("a tabset alone at the root has no edge targets (its sides are the workspace's edges)", () => {
    const model: WorkspaceModel = { root: tabset("a", ["1", "2"]), version: 1 };

    expect(getTargets(model, "1")).toEqual(
      SIDES.map((region) => ({ region, tabsetId: "a" }))
    );
  });

  test("tabs that aren't in the model have no targets", () => {
    expect(getTargets(createModel(), "missing")).toEqual([]);
  });
});
