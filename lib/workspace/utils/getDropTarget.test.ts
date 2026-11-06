import { afterEach, describe, expect, test } from "vitest";
import type { DragSource, WorkspaceModel } from "../types";
import { getDropTarget } from "./getDropTarget";

const model: WorkspaceModel = {
  root: {
    id: "tabset",
    selectedId: "1",
    tabs: [{ data: undefined, id: "1" }],
    type: "tabset"
  },
  version: 1
};

describe("getDropTarget", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  test("hit tests within a workspace's shadow root", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    cleanup = () => host.remove();

    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <div data-workspace>
        <div data-tabset-id="tabset">
          <div data-tab-list></div>
          <div data-tab-panels></div>
        </div>
      </div>
    `;
    const rootElement =
      shadowRoot.querySelector<HTMLElement>("[data-workspace]")!;
    const tabList = shadowRoot.querySelector("[data-tab-list]")!;

    // The document reports the shadow host for points within its shadow root (elementFromPoint isn't implemented by jsdom)
    Object.assign(document, { elementFromPoint: () => host });
    Object.assign(shadowRoot, { elementFromPoint: () => tabList });
    const prevCleanup = cleanup;
    cleanup = () => {
      prevCleanup();
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    };

    expect(
      getDropTarget({
        clientX: 0,
        clientY: 0,
        model,
        rootElement,
        source: { tabId: "2", type: "tab" }
      })
    ).toEqual({ index: 0, tabsetId: "tabset" });
  });
});

describe("getDropTarget for tabsets", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  function setup({ keepWhenEmpty = false } = {}) {
    const model: WorkspaceModel = {
      root: {
        children: [
          {
            id: "a",
            keepWhenEmpty,
            selectedId: "1",
            tabs: [{ data: undefined, id: "1" }],
            type: "tabset"
          },
          {
            id: "b",
            selectedId: "2",
            tabs: [{ data: undefined, id: "2" }],
            type: "tabset"
          }
        ],
        id: "root",
        orientation: "horizontal",
        type: "split"
      },
      version: 1
    };

    const container = document.createElement("div");
    container.innerHTML = `
      <div data-workspace>
        <div data-tabset-id="a">
          <div data-tab-list></div>
          <div data-tab-panels></div>
        </div>
        <div data-tabset-id="b">
          <div data-tab-list></div>
          <div data-tab-panels></div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const rootElement =
      container.querySelector<HTMLElement>("[data-workspace]")!;
    for (const panels of container.querySelectorAll("[data-tab-panels]")) {
      panels.getBoundingClientRect = () =>
        ({ height: 100, left: 0, top: 0, width: 100 }) as DOMRect;
    }

    let elementAtPoint: Element | null = null;
    Object.assign(document, { elementFromPoint: () => elementAtPoint });
    cleanup = () => {
      container.remove();
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    };

    const getTarget = (
      tabsetId: string,
      part: "panels" | "list",
      clientX = 50
    ) => {
      elementAtPoint = container.querySelector(
        `[data-tabset-id="${tabsetId}"] [data-tab-${part}]`
      );

      return getDropTarget({
        clientX,
        clientY: 50,
        model,
        rootElement,
        source: { tabsetId: "a", type: "tabset" }
      });
    };

    return { getTarget };
  }

  test("targets the regions and tab lists of other tabsets", () => {
    const { getTarget } = setup();

    expect(getTarget("b", "panels", 5)).toEqual({
      region: "left",
      tabsetId: "b"
    });
    expect(getTarget("b", "panels")).toEqual({
      region: "center",
      tabsetId: "b"
    });
    expect(getTarget("b", "list")).toEqual({ index: 0, tabsetId: "b" });
  });

  test("doesn't target the dragged tabset", () => {
    const { getTarget } = setup();

    expect(getTarget("a", "panels", 5)).toBeUndefined();
    expect(getTarget("a", "panels")).toBeUndefined();
    expect(getTarget("a", "list")).toBeUndefined();
  });

  test("only targets the edges of other tabsets when the dragged tabset is kept when empty", () => {
    const { getTarget } = setup({ keepWhenEmpty: true });

    expect(getTarget("b", "panels", 5)).toEqual({
      region: "left",
      tabsetId: "b"
    });
    expect(getTarget("b", "panels")).toBeUndefined();
    expect(getTarget("b", "list")).toBeUndefined();
  });
});

describe("getDropTarget for empty tabsets", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  function setup({ keepWhenEmpty = false } = {}) {
    const model: WorkspaceModel = {
      root: {
        id: "tabset",
        keepWhenEmpty,
        tabs: [],
        type: "tabset"
      },
      version: 1
    };

    const container = document.createElement("div");
    container.innerHTML = `
      <div data-workspace>
        <div data-tabset-id="tabset">
          <div data-tab-list></div>
          <div data-tab-panels></div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const rootElement =
      container.querySelector<HTMLElement>("[data-workspace]")!;
    const panels = container.querySelector("[data-tab-panels]")!;
    panels.getBoundingClientRect = () =>
      ({ height: 100, left: 0, top: 0, width: 100 }) as DOMRect;

    Object.assign(document, { elementFromPoint: () => panels });
    cleanup = () => {
      container.remove();
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    };

    // An empty root tabset can only be the target of a drop from another workspace
    const getTarget = (source: DragSource, clientX: number) =>
      getDropTarget({
        clientX,
        clientY: 50,
        isExternal: true,
        model,
        rootElement,
        source
      });

    return { getTarget };
  }

  test("only targets the center of an empty tabset that isn't kept when empty", () => {
    const { getTarget } = setup();

    for (const source of [
      { tabId: "1", type: "tab" },
      { tabsetId: "other", type: "tabset" }
    ] satisfies DragSource[]) {
      expect(getTarget(source, 5)).toEqual({
        region: "center",
        tabsetId: "tabset"
      });
      expect(getTarget(source, 50)).toEqual({
        region: "center",
        tabsetId: "tabset"
      });
    }
  });

  test("targets the edges of an empty tabset that's kept when empty", () => {
    const { getTarget } = setup({ keepWhenEmpty: true });

    for (const source of [
      { tabId: "1", type: "tab" },
      { tabsetId: "other", type: "tabset" }
    ] satisfies DragSource[]) {
      expect(getTarget(source, 5)).toEqual({
        region: "left",
        tabsetId: "tabset"
      });
    }
  });
});
