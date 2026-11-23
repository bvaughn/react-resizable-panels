// @vitest-environment jsdom

import { expect, test } from "vitest";
import type { TabsetNode, WorkspaceModel } from "../types";
import { createTabsetElementRegistry } from "./createTabsetElementRegistry";
import { getKeyboardDropTargets } from "./getKeyboardDropTargets";

function setup() {
  const left: TabsetNode = {
    id: "left",
    type: "tabset",
    selectedId: "1",
    tabs: [{ id: "1", data: null }]
  };
  const right: TabsetNode = {
    id: "right",
    type: "tabset",
    selectedId: "2",
    tabs: [{ id: "2", data: null }]
  };
  const model: WorkspaceModel = {
    version: 1,
    root: {
      id: "root",
      type: "split",
      orientation: "horizontal",
      children: [left, right]
    }
  };
  const registry = createTabsetElementRegistry();
  const register = (id: string) =>
    registry.register(id, {
      tabset: document.createElement("div"),
      tabList: null,
      panels: null
    });
  register("left");
  register("right");
  return { model, left, right, registry, register };
}

test.each([false, true])(
  "keyboard targets omit no-op edges and respect RTL (%s)",
  (rtl) => {
    const { model, registry } = setup();
    const targets = getKeyboardDropTargets(model, "1", registry, rtl);
    expect(targets[0]).toEqual({ tabsetId: "right", region: "center" });
    expect(targets).not.toContainEqual({ tabsetId: "left", region: "left" });
    expect(targets).not.toContainEqual({ edge: rtl ? "right" : "left" });
    expect(targets).toContainEqual({ edge: rtl ? "left" : "right" });
  }
);

test("only a maximized tabset and floating tabsets are destinations", () => {
  const { model, left, registry, register } = setup();
  left.tabs.push({ id: "other", data: null });
  model.maximizedTabsetId = "left";
  model.floating = [
    {
      id: "floating",
      type: "tabset",
      selectedId: "3",
      tabs: [{ id: "3", data: null }],
      x: 0,
      y: 0,
      width: 100,
      height: 100
    }
  ];
  register("floating");
  const targets = getKeyboardDropTargets(model, "1", registry, false);
  expect(targets[0]).toEqual({ tabsetId: "floating", region: "center" });
  expect(targets).toContainEqual({ tabsetId: "left", region: "left" });
  expect(targets).not.toContainEqual({ tabsetId: "floating", region: "left" });
  expect(targets).not.toContainEqual({ tabsetId: "right", region: "center" });
  expect(targets.some((target) => "edge" in target)).toBe(false);
});

test("unregistered and collapsed tabsets cannot be split, but kept empty tabsets can", () => {
  const { model, right, registry } = setup();
  right.collapsed = true;
  expect(
    getKeyboardDropTargets(model, "1", registry, false)
  ).not.toContainEqual({ tabsetId: "right", region: "top" });
  right.collapsed = false;
  right.tabs = [];
  right.keepWhenEmpty = true;
  expect(getKeyboardDropTargets(model, "1", registry, false)).toContainEqual({
    tabsetId: "right",
    region: "top"
  });
  expect(getKeyboardDropTargets(model, "missing", registry, false)).toEqual([]);
  expect(
    getKeyboardDropTargets(
      model,
      "1",
      createTabsetElementRegistry(),
      false
    ).some((target) => "tabsetId" in target)
  ).toBe(false);
});
