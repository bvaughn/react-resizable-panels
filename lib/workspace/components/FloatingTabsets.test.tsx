import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { useParentTab } from "../hooks/useParentTab";
import { useParentTabset } from "../hooks/useParentTabset";
import { useParentTabsetState } from "../hooks/useParentTabsetState";
import type {
  FloatingTabsetNode,
  ParentTab,
  ParentTabsetState,
  TabNode,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceProps
} from "../types";
import { Workspace } from "./Workspace";

type TabData = { label: string };

function tab(id: string): TabNode<TabData> {
  return { data: { label: `content ${id}` }, id };
}

function floating(
  id: string,
  tabIds: string[],
  rect: Partial<FloatingTabsetNode<TabData>> = {}
): FloatingTabsetNode<TabData> {
  return {
    height: 200,
    id,
    selectedId: tabIds[0],
    tabs: tabIds.map(tab),
    type: "tabset",
    width: 300,
    x: 0,
    y: 0,
    ...rect
  };
}

function createModel(
  floatingTabsets: FloatingTabsetNode<TabData>[] = []
): WorkspaceModel<TabData> {
  return {
    floating: floatingTabsets,
    root: {
      children: [
        { id: "left", tabs: [tab("1"), tab("2")], type: "tabset" },
        { id: "right", tabs: [tab("3")], type: "tabset" }
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1
  };
}

// Counts mounts, to check that moving a tab into (or out of) a floating tabset doesn't remount its content
const mounts = new Map<string, number>();
function Content({ tab }: { tab: TabNode<TabData> }) {
  useEffect(() => {
    mounts.set(tab.id, (mounts.get(tab.id) ?? 0) + 1);
  }, [tab.id]);

  return <div data-testid={`content-${tab.id}`}>{tab.data.label}</div>;
}

function renderWorkspace(props: Partial<WorkspaceProps<TabData>> = {}) {
  const workspaceRef = createRef<WorkspaceImperativeHandle<TabData>>();
  const onModelChanged = vi.fn();

  const result = render(
    <Workspace<TabData>
      defaultModel={createModel()}
      onModelChanged={onModelChanged}
      renderTabContent={(tab) => <Content tab={tab} />}
      workspaceRef={workspaceRef}
      {...props}
    />
  );

  return { ...result, onModelChanged, workspaceRef };
}

function getFloating(container: HTMLElement, tabsetId: string) {
  return container.querySelector<HTMLElement>(
    `[data-floating-tabset="${tabsetId}"]`
  )!;
}

function getHeader(container: HTMLElement, tabsetId: string) {
  return container.querySelector<HTMLElement>(
    `[data-tabset-id="${tabsetId}"] [data-tabset-header]`
  )!;
}

// jsdom has no layout, so the floating tabset's element reports the position and size the model gives it
function mockLayout(element: HTMLElement, node: FloatingTabsetNode) {
  Object.defineProperties(element, {
    offsetHeight: { configurable: true, value: node.height },
    offsetLeft: { configurable: true, value: node.x },
    offsetTop: { configurable: true, value: node.y },
    offsetWidth: { configurable: true, value: node.width }
  });
}

async function press(
  target: HTMLElement,
  moves: { clientX: number; clientY: number }[],
  release = true
) {
  await userEvent.pointer([
    {
      coords: { clientX: 100, clientY: 100 },
      keys: "[MouseLeft>]",
      target
    },
    ...moves.map((coords) => ({ coords, target })),
    ...(release ? [{ keys: "[/MouseLeft]", target }] : [])
  ]);
}

describe("floating tabsets", () => {
  beforeEach(() => {
    mounts.clear();
    resetWarnOnceForTest();
  });

  describe("rendering", () => {
    test("renders floating tabsets above the layout, at their positions and sizes", () => {
      const { container } = renderWorkspace({
        defaultModel: createModel([
          floating("f", ["4"], { height: 150, width: 250, x: 10, y: 20 })
        ])
      });

      const layer = container.querySelector<HTMLElement>(
        "[data-workspace-floating]"
      )!;
      // After the layout, so that it's shown above it
      expect(layer.previousElementSibling).toHaveAttribute(
        "data-workspace-layout"
      );

      const element = getFloating(container, "f");
      expect(layer).toContainElement(element);
      expect(element).toHaveStyle({
        height: "150px",
        left: "10px",
        position: "absolute",
        top: "20px",
        width: "250px"
      });
      expect(element.querySelector('[data-tabset-id="f"]')).toHaveAttribute(
        "data-tabset-floating"
      );
      expect(screen.getByTestId("content-4")).toBeInTheDocument();

      expect(
        container.querySelector('[data-tabset-id="left"]')
      ).not.toHaveAttribute("data-tabset-floating");
    });

    test("doesn't render the layer without floating tabsets", () => {
      const { container } = renderWorkspace();

      expect(
        container.querySelector("[data-workspace-floating]")
      ).not.toBeInTheDocument();
    });

    test("stacks floating tabsets in their model order", () => {
      const { container } = renderWorkspace({
        defaultModel: createModel([floating("a", ["4"]), floating("b", ["5"])])
      });

      expect(getFloating(container, "a").style.zIndex).toBe("1");
      expect(getFloating(container, "b").style.zIndex).toBe("2");
    });

    test("renders resize handles at each edge and corner", () => {
      const { container } = renderWorkspace({
        classNames: { floatingResizeHandle: "handle", floatingTabset: "frame" },
        defaultModel: createModel([floating("f", ["4"])])
      });

      const element = getFloating(container, "f");
      expect(element).toHaveClass("frame");
      expect(
        Array.from(
          element.querySelectorAll("[data-floating-resize-handle]"),
          (handle) => handle.getAttribute("data-floating-resize-handle")
        ).sort((a, b) => (a ?? "").localeCompare(b ?? ""))
      ).toEqual([
        "bottom",
        "bottom-left",
        "bottom-right",
        "left",
        "right",
        "top",
        "top-left",
        "top-right"
      ]);
      expect(
        element.querySelector('[data-floating-resize-handle="left"]')
      ).toHaveClass("handle");
    });

    test("doesn't render resize handles for disabled workspaces, or tabsets that can't be dragged", () => {
      const { container, rerender } = renderWorkspace({
        defaultModel: createModel([
          { ...floating("f", ["4"]), disableDrag: true }
        ])
      });
      expect(
        container.querySelector("[data-floating-resize-handle]")
      ).not.toBeInTheDocument();

      rerender(
        <Workspace<TabData>
          defaultModel={createModel([floating("g", ["5"])])}
          disabled
          renderTabContent={(tab) => <Content tab={tab} />}
        />
      );
      expect(
        container.querySelector("[data-floating-resize-handle]")
      ).not.toBeInTheDocument();
    });

    test("renders collapsed tabsets as large as their headers across them, resizable only along them", () => {
      const getHandles = (element: HTMLElement) =>
        Array.from(
          element.querySelectorAll("[data-floating-resize-handle]"),
          (handle) => handle.getAttribute("data-floating-resize-handle")
        ).sort((a, b) => (a ?? "").localeCompare(b ?? ""));

      const { container } = renderWorkspace({
        defaultModel: createModel([
          { ...floating("f", ["4"]), collapsed: true },
          { ...floating("g", ["5"]), collapsed: true, tabPlacement: "left" }
        ])
      });

      const element = getFloating(container, "f");
      expect(element).toHaveAttribute("data-tabset-collapsed");
      expect(element.style.height).toBe("auto");
      expect(element.style.width).toBe("300px");
      expect(getHandles(element)).toEqual(["left", "right"]);
      expect(
        element.querySelector("[data-tab-panels]") as HTMLElement
      ).toHaveStyle({ display: "none" });
      // Its content stays mounted
      expect(screen.getByTestId("content-4")).toBeInTheDocument();

      // A header placed on the side runs along the tabset's height
      const vertical = getFloating(container, "g");
      expect(vertical.style.height).toBe("200px");
      expect(vertical.style.width).toBe("auto");
      expect(getHandles(vertical)).toEqual(["bottom", "top"]);
    });

    test("is shown above a maximized tabset", () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("f", ["4"])])
      });

      act(() => workspaceRef.current!.maximizeTabset("left"));

      const overlay = container.querySelector("[data-workspace-maximized]")!;
      expect(overlay.nextElementSibling).toHaveAttribute(
        "data-workspace-floating"
      );
      // The layer isn't made inert with the rest of the layout
      expect(
        container.querySelector("[data-workspace-floating]")
      ).not.toHaveAttribute("inert");
    });
  });

  describe("imperative API", () => {
    test("floatTab moves a tab into a new floating tabset without remounting its content", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace();
      expect(mounts.get("2")).toBe(1);

      act(() =>
        workspaceRef.current!.floatTab("2", {
          height: 100,
          width: 200,
          x: 30,
          y: 40
        })
      );

      const model = workspaceRef.current!.getModel();
      expect(model.floating).toHaveLength(1);
      expect(model.floating?.[0]).toMatchObject({
        height: 100,
        tabs: [tab("2")],
        width: 200,
        x: 30,
        y: 40
      });
      expect(onModelChanged).toHaveBeenLastCalledWith(model, {
        isUserInteraction: false,
        reason: "float"
      });

      const element = getFloating(container, model.floating![0].id);
      expect(element).toContainElement(screen.getByTestId("content-2"));
      expect(mounts.get("2")).toBe(1);
    });

    test("floatTabset uses a default position and size for parts that aren't specified", () => {
      const { workspaceRef } = renderWorkspace();

      act(() => workspaceRef.current!.floatTabset("right", { width: 400 }));

      // jsdom has no layout to measure
      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        height: 240,
        id: "right",
        width: 400,
        x: 24,
        y: 24
      });
    });

    test("moveTabset docks a floating tabset", () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("f", ["4"])])
      });

      act(() => workspaceRef.current!.moveTabset("f", { edge: "right" }));

      expect(workspaceRef.current!.getModel().floating).toBeUndefined();
      expect(
        container.querySelector('[data-tabset-id="f"]')
      ).not.toHaveAttribute("data-tabset-floating");
      expect(mounts.get("4")).toBe(1);
    });

    test("updateTabset moves and resizes a floating tabset", () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("f", ["4"])])
      });

      act(() => workspaceRef.current!.updateTabset("f", { width: 123, x: 45 }));

      expect(getFloating(container, "f")).toHaveStyle({
        left: "45px",
        width: "123px"
      });
    });
  });

  describe("hooks", () => {
    test("useParentTab and useParentTabset float tabs and tabsets", () => {
      let parentTab: ParentTab | null = null;
      let parentTabset: ReturnType<typeof useParentTabset> = null;
      let state: ParentTabsetState | null = null;
      function Probe() {
        parentTab = useParentTab();
        parentTabset = useParentTabset();
        state = useParentTabsetState();
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "1" ? <Probe /> : null)
      });
      expect(state!.isFloating).toBe(false);
      expect(parentTabset!.isFloating()).toBe(false);

      act(() => parentTab!.float({ x: 5, y: 6 }));
      expect(state!.isFloating).toBe(true);
      expect(parentTabset!.isFloating()).toBe(true);
      const floatingId = workspaceRef.current!.getModel().floating![0].id;
      expect(parentTabset!.id).toBe(floatingId);

      // The tabset handle belongs to the new floating tabset now; float the other tabset with the tabset handle instead
      act(() =>
        workspaceRef.current!.moveTab("1", { index: 0, tabsetId: "right" })
      );
      expect(state!.isFloating).toBe(false);
      act(() => parentTabset!.float());
      expect(
        workspaceRef.current!.getModel().floating?.map(({ id }) => id)
      ).toEqual(["right"]);
    });
  });

  describe("collapsing", () => {
    test("useParentTabset collapses and expands floating tabsets (without the collapsible flag)", () => {
      let parentTabset: ReturnType<typeof useParentTabset> = null;
      let state: ParentTabsetState | null = null;
      function Probe() {
        parentTabset = useParentTabset();
        state = useParentTabsetState();
        return null;
      }

      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("f", ["4"])]),
        renderTabContent: (tab) => (tab.id === "4" ? <Probe /> : null)
      });
      expect(state!.isCollapsible).toBe(true);

      act(() => parentTabset!.collapse());
      expect(state!.isCollapsed).toBe(true);
      expect(parentTabset!.isCollapsed()).toBe(true);
      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        collapsed: true,
        height: 200,
        width: 300
      });
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "collapse"
      });
      expect(getFloating(container, "f").style.height).toBe("auto");

      act(() => parentTabset!.expand());
      expect(state!.isCollapsed).toBe(false);
      expect(getFloating(container, "f").style.height).toBe("200px");
    });

    test("clicking a tab of a collapsed floating tabset expands it", async () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createModel([
          { ...floating("f", ["4", "5"]), collapsed: true }
        ])
      });

      await userEvent.click(
        getFloating(container, "f").querySelector<HTMLElement>(
          '[data-tab-id="5"]'
        )!
      );

      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        selectedId: "5"
      });
      expect(workspaceRef.current!.getModel().floating?.[0]).not.toHaveProperty(
        "collapsed"
      );
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "expand"
      });
    });

    test("resizing a collapsed floating tabset keeps the height it expands to", async () => {
      const node = {
        ...floating("f", ["4"], { x: 10, y: 20 }),
        collapsed: true
      };
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([node])
      });
      const element = getFloating(container, "f");
      // Only its header is shown
      mockLayout(element, { ...node, height: 30 });

      await press(
        element.querySelector<HTMLElement>(
          '[data-floating-resize-handle="left"]'
        )!,
        [{ clientX: 150, clientY: 100 }]
      );

      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        collapsed: true,
        height: 200,
        width: 250,
        x: 60
      });
      expect(element.style.height).toBe("auto");

      // (jsdom has no layout, so the move starts from the mocked position)
      await press(getHeader(container, "f"), [{ clientX: 120, clientY: 130 }]);

      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        collapsed: true,
        height: 200,
        x: 30,
        y: 50
      });
      expect(element.style.height).toBe("auto");
    });

    test("Escape during a resize puts a collapsed floating tabset back", async () => {
      const node = {
        ...floating("f", ["4"], { x: 10, y: 20 }),
        collapsed: true
      };
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([node])
      });
      const element = getFloating(container, "f");
      mockLayout(element, { ...node, height: 30 });
      const before = workspaceRef.current!.getModel();

      await press(
        element.querySelector<HTMLElement>(
          '[data-floating-resize-handle="left"]'
        )!,
        [{ clientX: 150, clientY: 100 }],
        false
      );
      expect(element.style.left).toBe("60px");

      await userEvent.keyboard("{Escape}");
      await userEvent.pointer({ keys: "[/MouseLeft]", target: element });

      expect(element.style.left).toBe("10px");
      expect(element.style.width).toBe("300px");
      expect(element.style.height).toBe("auto");
      expect(workspaceRef.current!.getModel()).toEqual(before);
    });

    test("resizing a collapsed floating tabset with a vertical header only changes its height", async () => {
      const node = {
        ...floating("f", ["4"], { x: 10, y: 20 }),
        collapsed: true,
        tabPlacement: "left" as const
      };
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([node])
      });
      const element = getFloating(container, "f");
      // Only its header is shown
      mockLayout(element, { ...node, width: 30 });

      await press(
        element.querySelector<HTMLElement>(
          '[data-floating-resize-handle="top"]'
        )!,
        [{ clientX: 100, clientY: 130 }]
      );

      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        collapsed: true,
        height: 170,
        width: 300,
        x: 10,
        y: 50
      });
      expect(element.style.width).toBe("auto");
      expect(element.style.height).toBe("170px");
    });
  });

  describe("user interaction", () => {
    test("pressing a floating tabset that's behind another brings it to the front, without reordering the elements", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("a", ["4"]), floating("b", ["5"])])
      });
      const elements = Array.from(
        container.querySelectorAll("[data-floating-tabset]")
      );

      fireEvent.pointerDown(screen.getByTestId("content-4"));

      expect(
        workspaceRef.current!.getModel().floating?.map(({ id }) => id)
      ).toEqual(["b", "a"]);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "raise"
      });
      expect(getFloating(container, "a").style.zIndex).toBe("2");
      expect(
        Array.from(container.querySelectorAll("[data-floating-tabset]"))
      ).toEqual(elements);

      // Pressing the front tabset doesn't change the model
      onModelChanged.mockClear();
      fireEvent.pointerDown(screen.getByTestId("content-4"));
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("dragging a floating tabset's header moves it", async () => {
      const node = floating("f", ["4"], { x: 10, y: 20 });
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createModel([node])
      });
      mockLayout(getFloating(container, "f"), node);

      await press(getHeader(container, "f"), [
        { clientX: 120, clientY: 110 },
        { clientX: 150, clientY: 130 }
      ]);

      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        height: 200,
        width: 300,
        x: 60,
        y: 50
      });
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "move"
      });
    });

    test("a press on the header without moving doesn't move the tabset", async () => {
      const node = floating("f", ["4"], { x: 10, y: 20 });
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: createModel([node])
      });
      mockLayout(getFloating(container, "f"), node);

      await press(getHeader(container, "f"), [{ clientX: 101, clientY: 101 }]);

      expect(onModelChanged).not.toHaveBeenCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "move"
      });
    });

    test("dragging a resize handle resizes the tabset", async () => {
      const node = floating("f", ["4"], { x: 10, y: 20 });
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createModel([node])
      });
      const element = getFloating(container, "f");
      mockLayout(element, node);

      await press(
        element.querySelector<HTMLElement>(
          '[data-floating-resize-handle="top-left"]'
        )!,
        [{ clientX: 80, clientY: 90 }]
      );

      // The opposite corner stays where it was, and the dragged edges stay within the layout
      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        height: 210,
        width: 310,
        x: 0,
        y: 10
      });
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "resize"
      });
    });

    test("resizing stops at the tabset's minimum size", async () => {
      const node = floating("f", ["4"], { x: 10, y: 20 });
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([node]),
        tabsetMinHeight: "50px",
        tabsetMinWidth: "100px"
      });
      const element = getFloating(container, "f");
      mockLayout(element, node);

      await press(
        element.querySelector<HTMLElement>(
          '[data-floating-resize-handle="bottom-right"]'
        )!,
        [{ clientX: -500, clientY: -500 }]
      );

      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        height: 50,
        width: 100,
        x: 10,
        y: 20
      });
    });

    test("Escape puts the tabset back", async () => {
      const node = floating("f", ["4"], { x: 10, y: 20 });
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: createModel([node])
      });
      const element = getFloating(container, "f");
      mockLayout(element, node);

      await press(
        getHeader(container, "f"),
        [{ clientX: 150, clientY: 150 }],
        false
      );
      expect(element.style.left).toBe("60px");

      await userEvent.keyboard("{Escape}");
      await userEvent.pointer({ keys: "[/MouseLeft]", target: element });

      expect(element.style.left).toBe("10px");
      expect(onModelChanged).not.toHaveBeenCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "move"
      });
    });

    test("floating tabsets can't be moved in a disabled workspace (but can still be raised)", async () => {
      const node = floating("f", ["4"], { x: 10, y: 20 });
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: createModel([node, floating("g", ["5"])]),
        disabled: true
      });
      mockLayout(getFloating(container, "f"), node);

      await press(getHeader(container, "f"), [{ clientX: 150, clientY: 150 }]);

      expect(onModelChanged).toHaveBeenCalledTimes(1);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "raise"
      });
    });
  });

  describe("dragging tabs", () => {
    let elementAtPoint: Element | null = null;

    beforeEach(() => {
      document.elementFromPoint = () => elementAtPoint;
    });

    afterEach(() => {
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    });

    function getTab(name: string) {
      return screen.getByRole("tab", { name: new RegExp(`^${name}`) });
    }

    function getPanels(container: HTMLElement, tabsetId: string) {
      return container.querySelector<HTMLElement>(
        `[data-tabset-id="${tabsetId}"] [data-tab-panels]`
      )!;
    }

    async function drag(from: HTMLElement, to: HTMLElement) {
      elementAtPoint = to;
      await userEvent.pointer([
        {
          coords: { clientX: 100, clientY: 100 },
          keys: "[MouseLeft>]",
          target: from
        },
        { coords: { clientX: 150, clientY: 150 }, target: to },
        { keys: "[/MouseLeft]", target: to }
      ]);
    }

    test("tabs dropped onto a floating tabset are added to it", async () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("f", ["4"])])
      });

      await drag(getTab("2"), getPanels(container, "f"));

      expect(
        workspaceRef.current!.getModel().floating?.[0].tabs.map(({ id }) => id)
      ).toEqual(["4", "2"]);
      expect(mounts.get("2")).toBe(1);
    });

    test("tabs dragged out of a floating tabset are docked, and the emptied tabset is removed", async () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createModel([floating("f", ["4"])])
      });

      await drag(getTab("4"), getPanels(container, "right"));

      expect(workspaceRef.current!.getModel().floating).toBeUndefined();
      expect(
        container.querySelector('[data-tabset-id="right"]')
      ).toContainElement(getTab("4"));
      expect(mounts.get("4")).toBe(1);
    });
  });
});
