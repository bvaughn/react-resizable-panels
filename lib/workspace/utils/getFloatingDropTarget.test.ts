// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest";
import { setElementBounds } from "../../shared/utils/test/mockBoundingClientRect";
import type { WorkspaceModel } from "../types";
import { createTabsetElementRegistry } from "./createTabsetElementRegistry";
import { getDropTarget } from "./getDropTarget";

let container: HTMLDivElement;
afterEach(() => {
  container?.remove();
  // @ts-expect-error jsdom does not implement hit testing.
  delete document.elementFromPoint;
});

function setup(scale = 1) {
  container = document.createElement("div");
  container.innerHTML = `<div data-workspace><div data-workspace-layout><div data-tabset-id="a"><div data-tab-list></div><div data-tab-panels></div></div></div></div>`;
  document.body.append(container);
  const rootElement = container.querySelector<HTMLElement>("[data-workspace]")!;
  const layout = container.querySelector<HTMLElement>(
    "[data-workspace-layout]"
  )!;
  const tabset = container.querySelector<HTMLElement>("[data-tabset-id]")!;
  const panels = container.querySelector<HTMLElement>("[data-tab-panels]")!;
  setElementBounds(layout, new DOMRect(10, 20, 800 * scale, 600 * scale));
  Object.defineProperties(layout, {
    offsetWidth: { configurable: true, value: 800 },
    offsetHeight: { configurable: true, value: 600 }
  });
  setElementBounds(tabset, new DOMRect(10, 20, 400 * scale, 300 * scale));
  setElementBounds(panels, new DOMRect(10, 20, 400 * scale, 300 * scale));
  document.elementFromPoint = () => panels;
  const tabsetElements = createTabsetElementRegistry();
  tabsetElements.register("a", { tabset, tabList: null, panels });
  const model: WorkspaceModel = {
    version: 1,
    root: {
      id: "a",
      type: "tabset",
      selectedId: "1",
      tabs: [
        { id: "1", data: null },
        { id: "2", data: null }
      ]
    }
  };
  return {
    rootElement,
    tabsetElements,
    model,
    source: { type: "tab" as const, tabId: "1" },
    clientX: 210 * scale - 10 * (scale - 1),
    clientY: 170 * scale - 20 * (scale - 1)
  };
}

test.each([1, 2])(
  "floating targets use unscaled layout coordinates (%s)",
  (scale) => {
    const args = setup(scale);
    const target = getDropTarget({
      ...args,
      floatOnDrop: "modifier",
      shiftKey: true
    });
    expect(target).toEqual({
      float: { width: 400, height: 300, x: 0, y: 134 }
    });
    expect(
      getDropTarget({
        ...args,
        clientX: 10 + 800 * scale,
        clientY: 20 + 600 * scale,
        floatOnDrop: "modifier",
        shiftKey: true
      })
    ).toEqual({ float: { width: 400, height: 300, x: 400, y: 300 } });
  }
);

test("floating is opt-in and outside-targets uses undockable space", () => {
  const args = setup();
  expect(getDropTarget({ ...args, shiftKey: true })).toBeUndefined();
  expect(getDropTarget({ ...args, floatOnDrop: "modifier" })).toBeUndefined();
  expect(
    getDropTarget({ ...args, floatOnDrop: "outside-targets" })
  ).toHaveProperty("float");
  expect(
    getDropTarget({
      ...args,
      clientX: 210,
      clientY: 30,
      floatOnDrop: "outside-targets"
    })
  ).toEqual({ tabsetId: "a", region: "top" });
});

test("does not float a root tabset, outside the layout or over a nested workspace", () => {
  const args = setup();
  expect(
    getDropTarget({
      ...args,
      source: { type: "tabset", tabsetId: "a" },
      floatOnDrop: "modifier",
      shiftKey: true
    })
  ).toBeUndefined();
  expect(
    getDropTarget({
      ...args,
      clientX: 1000,
      floatOnDrop: "modifier",
      shiftKey: true
    })
  ).not.toHaveProperty("float");
  const nested = document.createElement("div");
  nested.setAttribute("data-workspace", "");
  args.rootElement.append(nested);
  document.elementFromPoint = () => nested;
  expect(
    getDropTarget({ ...args, floatOnDrop: "modifier", shiftKey: true })
  ).toBeUndefined();
});
