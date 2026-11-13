import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createRef,
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { Group } from "../../flex/components/Group";
import { Panel } from "../../flex/components/Panel";
import { useParentPanel } from "../../flex/hooks/useParentPanel";
import { TabCloseButton } from "./TabCloseButton";
import { TabsetDragHandle } from "./TabsetDragHandle";
import type {
  DisableDropArgs,
  ParentTab,
  ParentTabset,
  ParentTabsetState,
  ParentTabState,
  SplitNode,
  TabNode,
  TabsetNode,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceProps
} from "../types";
import { useParentTab } from "../hooks/useParentTab";
import { useParentTabset } from "../hooks/useParentTabset";
import { useParentTabsetState } from "../hooks/useParentTabsetState";
import { useParentTabState } from "../hooks/useParentTabState";
import { useParentWorkspace } from "../hooks/useParentWorkspace";
import { useTabListFreeSpace } from "../hooks/useTabListFreeSpace";
import { useTabListOverflow } from "../hooks/useTabListOverflow";
import { getRegisteredAxis } from "../../global/mutable-state/axes";
import { updateInteractionState } from "../../global/mutable-state/interactions";
import { emitter } from "../../shared/utils/test/mockBoundingClientRect";
import { Workspace } from "./Workspace";

type TabData = { label: string };

function tab(
  id: string,
  extra: Partial<TabNode<TabData>> = {}
): TabNode<TabData> {
  return { data: { label: `content ${id}` }, id, ...extra };
}

function createModel(): WorkspaceModel<TabData> {
  return {
    root: {
      children: [
        {
          id: "left",
          selectedId: "1",
          tabs: [tab("1", { title: "One" }), tab("2")],
          type: "tabset"
        },
        {
          id: "right",
          selectedId: "3",
          tabs: [tab("3")],
          type: "tabset"
        }
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1
  };
}

function Content({ tab }: { tab: TabNode<TabData> }) {
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

function getTab(name: string) {
  return screen.getByRole("tab", { name: new RegExp(`^${name}`) });
}

// Renders a component that uses useParentTabState, and counts its renders
function createTabStateCounter() {
  let renderCount = 0;
  function TabState() {
    useParentTabState();
    renderCount++;
    return null;
  }

  return { TabState, getRenderCount: () => renderCount };
}

function isShown(element: HTMLElement) {
  return (
    // Tab panels are rendered within host elements, which are hidden when their tab isn't selected
    element.closest<HTMLElement>("[data-tab-content]")?.parentElement?.style
      .display !== "none"
  );
}

const TEAR_OFF_DEPRECATION = "The Workspace onTearOff prop is deprecated";

// The deprecated onTearOff prop logs a warning (in development); other warnings still fail the test (see vitest.setup.ts)
function allowTearOffDeprecationWarning() {
  let restore: (() => void) | undefined;
  beforeEach(() => {
    const spy = vi.spyOn(console, "warn");
    const prevImplementation = spy.getMockImplementation();
    spy.mockImplementation((message: unknown, ...rest: unknown[]) => {
      if (!String(message).includes(TEAR_OFF_DEPRECATION)) {
        prevImplementation?.(message, ...rest);
      }
    });
    restore = () => {
      if (prevImplementation) {
        spy.mockImplementation(prevImplementation);
      }
    };
  });
  afterEach(() => {
    restore?.();
  });
}

describe("Workspace", () => {
  beforeEach(() => {
    resetWarnOnceForTest();
  });

  describe("rendering", () => {
    test("renders tab content with the workspace's own window (e.g. a popup)", () => {
      const frame = document.createElement("iframe");
      document.body.appendChild(frame);

      try {
        const popupDocument = frame.contentDocument!;
        const popupWindow = popupDocument.defaultView!;
        popupWindow.ResizeObserver = window.ResizeObserver;

        const { unmount } = render(
          createPortal(
            <Workspace<TabData>
              defaultModel={createModel()}
              renderTabContent={(tab) => <Content tab={tab} />}
            />,
            popupDocument.body
          )
        );

        // Elements moved from another window's document keep that window's prototypes
        const content = popupDocument.querySelector(
          '[data-testid="content-1"]'
        );
        expect(content).toBeInstanceOf(popupWindow.HTMLElement);

        unmount();
      } finally {
        frame.remove();
      }
    });

    test("renders tabsets, tabs, and content", () => {
      const { container } = renderWorkspace();

      expect(container.querySelectorAll("[data-tabset]")).toHaveLength(2);
      expect(screen.getAllByRole("tablist")).toHaveLength(2);

      // Titles fall back to ids
      expect(getTab("One")).toHaveAttribute("aria-selected", "true");
      expect(getTab("2")).toHaveAttribute("aria-selected", "false");
      expect(getTab("One")).toHaveAttribute("data-tab-selected");
      expect(getTab("One")).toHaveAttribute("tabindex", "0");
      expect(getTab("2")).toHaveAttribute("tabindex", "-1");

      // Content is rendered into the tabset's panels, and only the selected tab's is shown
      const left = container.querySelector('[data-tabset-id="left"]')!;
      const content1 = screen.getByTestId("content-1");
      expect(left.querySelector("[data-tab-panels]")).toContainElement(
        content1
      );
      expect(isShown(content1)).toBe(true);
      expect(isShown(screen.getByTestId("content-2"))).toBe(false);

      // Tabs and content are linked for assistive technology
      const panel = content1.closest("[data-tab-content]")!;
      expect(panel).toHaveAttribute("role", "tabpanel");
      expect(getTab("One")).toHaveAttribute("aria-controls", panel.id);
      expect(panel).toHaveAttribute("aria-labelledby", getTab("One").id);
    });

    test("replaces a malformed model with an empty workspace", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const { container, workspaceRef } = renderWorkspace({
          defaultModel: JSON.parse('{"root":{"type":"tabset"},"version":1}')
        });

        expect(container.querySelectorAll("[data-tabset]")).toHaveLength(1);
        expect(screen.queryAllByRole("tab")).toHaveLength(0);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining("Invalid workspace model")
        );

        // setModel is also protected
        act(() => {
          workspaceRef.current!.setModel(
            null as unknown as WorkspaceModel<TabData>
          );
        });
        expect(container.querySelectorAll("[data-tabset]")).toHaveLength(1);
      } finally {
        warn.mockRestore();
      }
    });

    test("replaces a model with a malformed tab title with an empty workspace", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        renderWorkspace({
          defaultModel: JSON.parse(
            '{"root":{"type":"tabset","tabs":[{"id":"a","title":{}}]},"version":1}'
          )
        });

        expect(screen.queryAllByRole("tab")).toHaveLength(0);
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining("Invalid workspace model")
        );
      } finally {
        warn.mockRestore();
      }
    });

    test("does not call onModelChanged on mount", () => {
      const { onModelChanged } = renderWorkspace();
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("supports a root tabset, custom tabs, and a toolbar", () => {
      function SelectedTabId() {
        const state = useParentTabsetState();

        return <div data-testid="selected">{state?.selectedTabId}</div>;
      }

      const { container } = renderWorkspace({
        defaultModel: {
          root: {
            id: "only",
            tabs: [tab("1"), tab("2")],
            type: "tabset"
          },
          version: 1
        },
        renderTab: (tab, props) => (
          <span {...props} data-testid={`custom-${tab.id}`}>
            {tab.data.label}
          </span>
        ),
        renderTabsetToolbar: () => <SelectedTabId />
      });

      expect(container.querySelector("[data-tabset]")).toHaveAttribute(
        "data-tabset-id",
        "only"
      );
      expect(screen.getByTestId("custom-1")).toHaveAttribute("role", "tab");
      expect(screen.getByTestId("selected")).toHaveTextContent("1");

      fireEvent.click(getTab("content 2"));
      expect(screen.getByTestId("selected")).toHaveTextContent("2");
    });

    test("renderTab props can be wrapped", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div
            {...props}
            // e.g. to confirm before closing
            onKeyDown={(event) => {
              if (event.key !== "Delete") {
                props.onKeyDown?.(event);
              }
            }}
          >
            {tab.data.label}
          </div>
        )
      });

      act(() => getTab("content 1").focus());
      fireEvent.keyDown(getTab("content 1"), { key: "Delete" });
      expect(getTab("content 1")).toBeInTheDocument();

      fireEvent.keyDown(getTab("content 1"), { key: "ArrowRight" });
      expect(getTab("content 2")).toHaveFocus();
    });

    test("warns when renderTab doesn't attach its props", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        renderWorkspace({ renderTab: (tab) => <div>{tab.data.label}</div> });

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("must receive its props");
      } finally {
        warn.mockRestore();
      }
    });

    describe("with touch-action support", () => {
      // jsdom doesn't support touch-action, so the warning below can't be checked without it
      const values = new WeakMap<CSSStyleDeclaration, string>();
      beforeEach(() => {
        Object.defineProperty(CSSStyleDeclaration.prototype, "touchAction", {
          configurable: true,
          get(this: CSSStyleDeclaration) {
            return values.get(this) ?? "";
          },
          set(this: CSSStyleDeclaration, value: string) {
            values.set(this, value);
          }
        });
      });
      afterEach(() => {
        // @ts-expect-error Only defined by this test
        delete CSSStyleDeclaration.prototype.touchAction;
      });

      test("warns when renderTab replaces props.style", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        try {
          renderWorkspace({
            renderTab: (tab, props) => (
              <div {...props} style={{ padding: 4 }}>
                {tab.data.label}
              </div>
            )
          });

          expect(warn).toHaveBeenCalledTimes(1);
          expect(warn.mock.calls[0][0]).toContain("replaced props.style");
        } finally {
          warn.mockRestore();
        }
      });

      test("doesn't warn when renderTab merges props.style", () => {
        renderWorkspace({
          renderTab: (tab, props) => (
            <div {...props} style={{ ...props.style, padding: 4 }}>
              {tab.data.label}
            </div>
          )
        });

        // (Unexpected warnings fail the test)
      });
    });

    test("applies classNames and styles", () => {
      const { container } = renderWorkspace({
        classNames: {
          header: "header",
          tab: "tab",
          tabContent: "tab-content",
          tabList: "tab-list",
          tabPanels: "tab-panels",
          tabset: "tabset",
          toolbar: "toolbar"
        },
        renderTabsetToolbar: () => null,
        styles: {
          tab: { color: "red" },
          tabContent: {
            color: "blue",
            // Numbers are converted to pixels, as with any React style
            padding: 8
          }
        }
      });

      const tabset = container.querySelector("[data-tabset]")!;
      expect(tabset).toHaveClass("tabset");
      expect(tabset.querySelector("[data-tabset-header]")).toHaveClass(
        "header"
      );
      expect(tabset.querySelector("[data-tab-list]")).toHaveClass("tab-list");
      expect(tabset.querySelector("[data-tabset-toolbar]")).toHaveClass(
        "toolbar"
      );
      expect(tabset.querySelector("[data-tab-panels]")).toHaveClass(
        "tab-panels"
      );
      expect(getTab("One")).toHaveClass("tab");
      expect(getTab("One")).toHaveStyle({ color: "rgb(255, 0, 0)" });

      // Styles don't override whether tab content is shown
      const content = screen
        .getByTestId("content-2")
        .closest<HTMLElement>("[data-tab-content]")!;
      expect(content).toHaveClass("tab-content");
      expect(content).toHaveStyle({ color: "rgb(0, 0, 255)", padding: "8px" });
      expect(isShown(screen.getByTestId("content-2"))).toBe(false);
    });

    test("renderEmptyTabset is shown in tabsets without tabs", () => {
      renderWorkspace({
        defaultModel: {
          root: { id: "only", tabs: [], type: "tabset" },
          version: 1
        },
        renderEmptyTabset: (tabset) => (
          <div data-testid="empty">{tabset.id}</div>
        )
      });

      expect(screen.getByTestId("empty")).toHaveTextContent("only");
    });

    test("a tabset with keepWhenEmpty stays after its last tab is closed, until it's closed", () => {
      function CloseTabsetButton() {
        const tabset = useParentTabset();
        return <button onClick={() => tabset?.close()}>Close tabset</button>;
      }

      const model = createModel();
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: {
          ...model,
          root: {
            ...(model.root as SplitNode<TabData>),
            children: [
              (model.root as SplitNode<TabData>).children[0],
              {
                id: "right",
                keepWhenEmpty: true,
                tabs: [tab("3")],
                type: "tabset"
              }
            ]
          }
        },
        renderEmptyTabset: (tabset) => (
          <div data-testid={`empty-${tabset.id}`}>empty</div>
        ),
        renderTabsetToolbar: (tabset) =>
          tabset.tabs.length === 0 ? <CloseTabsetButton /> : null
      });

      fireEvent.click(screen.getByRole("button", { name: "Close 3" }));
      expect(screen.getByTestId("empty-right")).toBeInTheDocument();
      expect(container.querySelectorAll("[data-tabset]")).toHaveLength(2);

      fireEvent.click(screen.getByRole("button", { name: "Close tabset" }));
      expect(container.querySelectorAll("[data-tabset]")).toHaveLength(1);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "close"
      });
    });

    test("useParentTabsetState reports whether a tabset is the root (the only tabset)", () => {
      function IsRoot() {
        const tabset = useParentTabset();
        const isRoot = useParentTabsetState()?.isRoot;
        return (
          <div data-testid={`is-root-${tabset?.id}`}>{String(isRoot)}</div>
        );
      }

      const { workspaceRef } = renderWorkspace({
        renderTabsetToolbar: () => <IsRoot />
      });
      expect(screen.getByTestId("is-root-left")).toHaveTextContent("false");
      expect(screen.getByTestId("is-root-right")).toHaveTextContent("false");

      // Closing the other tabset leaves this one as the root
      act(() => {
        workspaceRef.current!.closeTabset("right");
      });
      expect(screen.getByTestId("is-root-left")).toHaveTextContent("true");
    });

    test("element ids are unique within the page, even with the same model in two workspaces", () => {
      const { container } = render(
        <>
          <Workspace<TabData>
            defaultModel={createModel()}
            renderTabContent={(tab) => <Content tab={tab} />}
          />
          <Workspace<TabData>
            defaultModel={createModel()}
            renderTabContent={(tab) => <Content tab={tab} />}
          />
        </>
      );

      const ids = Array.from(
        container.querySelectorAll("[id]"),
        ({ id }) => id
      );
      expect(new Set(ids).size).toBe(ids.length);

      // Node ids (e.g. "root") aren't used as element ids, since they could match the page's own (e.g. <div id="root">)
      for (const nodeId of ["root", "left", "right"]) {
        expect(ids).not.toContain(nodeId);
      }
    });

    test("classNames and styles apply to splits", () => {
      const { container } = renderWorkspace({
        classNames: { split: "custom-split" },
        styles: { split: { columnGap: "4px" } }
      });

      const split = container.querySelector<HTMLElement>("[data-split]")!;
      expect(split).toHaveAttribute("data-split-id", "root");
      expect(split).toHaveAttribute("data-group");
      expect(split).toHaveClass("custom-split");
      expect(split.style.columnGap).toBe("4px");
    });

    test("gaps between tabsets count toward minimum sizes", () => {
      const defaultModel: WorkspaceModel<TabData> = {
        root: {
          children: [
            { id: "a", tabs: [tab("1")], type: "tabset" },
            {
              children: [
                { id: "b", tabs: [tab("2")], type: "tabset" },
                {
                  children: [
                    { id: "c", tabs: [tab("3")], type: "tabset" },
                    { id: "d", tabs: [tab("4")], type: "tabset" }
                  ],
                  id: "inner",
                  orientation: "horizontal",
                  type: "split"
                }
              ],
              id: "middle",
              orientation: "vertical",
              type: "split"
            }
          ],
          id: "root",
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      };
      const getMiddleMinSize = () =>
        getRegisteredAxis("workspace-root", true).items.find(
          ({ id }) => id === "workspace:middle"
        )?.constraintProps.minSize;

      const { rerender } = render(
        <Workspace<TabData>
          defaultModel={defaultModel}
          id="workspace"
          renderTabContent={(tab) => <Content tab={tab} />}
          tabsetMinWidth="100px"
        />
      );

      // Two 100px tabsets, side by side
      expect(getMiddleMinSize()).toBe(200);

      rerender(
        <Workspace<TabData>
          defaultModel={defaultModel}
          id="workspace"
          renderTabContent={(tab) => <Content tab={tab} />}
          styles={{ split: { columnGap: "10px" } }}
          tabsetMinWidth="100px"
        />
      );

      // Plus gaps on either side of the separator between them
      expect(getMiddleMinSize()).toBe(220);
    });

    test("renderSeparator can return null for no separators", () => {
      const { container } = renderWorkspace({ renderSeparator: () => null });

      expect(container.querySelector("[data-separator]")).toBeNull();
    });

    test("orders the header after the panels for bottom and right placements", () => {
      const { container } = renderWorkspace({ tabPlacement: "right" });

      const tabset = container.querySelector("[data-tabset]")!;
      expect(tabset).toHaveAttribute("data-tab-placement", "right");
      expect(tabset.children[0]).toHaveAttribute("data-tab-panels");
      expect(tabset.children[1]).toHaveAttribute("data-tabset-header");
      expect(tabset.querySelector("[data-tab-list]")).toHaveAttribute(
        "aria-orientation",
        "vertical"
      );
      expect(getTab("One")).toHaveAttribute("data-tab-placement", "right");
    });

    test("a tabset's tabPlacement overrides the workspace's", () => {
      const { container } = renderWorkspace({
        defaultModel: {
          root: {
            children: [
              {
                id: "sidebar",
                tabPlacement: "left",
                tabs: [tab("1")],
                type: "tabset"
              },
              { id: "main", tabs: [tab("2")], type: "tabset" }
            ],
            id: "root",
            orientation: "horizontal",
            type: "split"
          },
          version: 1
        },
        tabPlacement: "bottom"
      });

      const [sidebar, main] = container.querySelectorAll("[data-tabset]");
      expect(sidebar).toHaveAttribute("data-tab-placement", "left");
      expect(sidebar.querySelector("[data-tab-list]")).toHaveAttribute(
        "aria-orientation",
        "vertical"
      );
      expect(main).toHaveAttribute("data-tab-placement", "bottom");
      expect(main.children[0]).toHaveAttribute("data-tab-panels");
    });

    test("updateTabset changes a tabset's placement", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace();

      act(() => {
        workspaceRef.current!.updateTabset("left", { tabPlacement: "left" });
      });

      const tabset = container.querySelector('[data-tabset-id="left"]')!;
      expect(tabset).toHaveAttribute("data-tab-placement", "left");
      expect(tabset.querySelector("[data-tab-list]")).toHaveAttribute(
        "aria-orientation",
        "vertical"
      );
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "update"
      });

      // Removing the override falls back to the Workspace's placement
      act(() => {
        workspaceRef.current!.updateTabset("left", { tabPlacement: undefined });
      });
      expect(tabset).toHaveAttribute("data-tab-placement", "top");
    });

    test("arrow keys follow the orientation of the tab list", () => {
      renderWorkspace({
        renderTab: (tab, props) => <div {...props}>{tab.data.label}</div>,
        tabPlacement: "right"
      });

      act(() => getTab("content 1").focus());
      fireEvent.keyDown(getTab("content 1"), { key: "ArrowDown" });
      expect(getTab("content 2")).toHaveFocus();
    });
  });

  describe("user interaction", () => {
    test("clicking a tab selects it", () => {
      const { onModelChanged } = renderWorkspace();

      fireEvent.click(getTab("2"));

      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
      expect(isShown(screen.getByTestId("content-2"))).toBe(true);
      expect(isShown(screen.getByTestId("content-1"))).toBe(false);
      expect(onModelChanged).toHaveBeenCalledTimes(1);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "select"
      });
    });

    test("the close button closes its tab", () => {
      const { onModelChanged } = renderWorkspace();

      const closeButton = screen.getByRole("button", { name: "Close One" });
      expect(closeButton).toHaveAttribute("tabindex", "-1");

      fireEvent.click(closeButton);

      expect(screen.queryByRole("tab", { name: /^One/ })).toBeNull();
      expect(screen.queryByTestId("content-1")).toBeNull();
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "close"
      });
    });

    test("preventDefault cancels the close button", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            {tab.id}
            <TabCloseButton onClick={(event) => event.preventDefault()} />
          </div>
        )
      });

      fireEvent.click(screen.getByRole("button", { name: "Close One" }));
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
    });

    test("interactive descendants don't select the tab", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            {tab.id}
            <span data-tab-ignore data-testid={`ignore-${tab.id}`} />
          </div>
        )
      });

      fireEvent.click(screen.getByTestId("ignore-2"));
      expect(getTab("2")).toHaveAttribute("aria-selected", "false");
    });

    test("disableClose and disabled hide close buttons", () => {
      const model = createModel();
      const { rerender } = renderWorkspace({
        defaultModel: {
          ...model,
          root: {
            id: "only",
            tabs: [tab("1", { disableClose: true }), tab("2")],
            type: "tabset"
          }
        }
      });

      expect(screen.queryByRole("button", { name: "Close 1" })).toBeNull();
      expect(
        screen.getByRole("button", { name: "Close 2" })
      ).toBeInTheDocument();

      rerender(
        <Workspace<TabData>
          defaultModel={model}
          disabled
          renderTabContent={(tab) => <Content tab={tab} />}
        />
      );
      expect(screen.queryByRole("button", { name: /^Close/ })).toBeNull();
    });
  });

  describe("keyboard", () => {
    test("arrow keys move focus, and Enter or Space selects", () => {
      renderWorkspace();

      act(() => getTab("One").focus());
      fireEvent.keyDown(getTab("One"), { key: "ArrowRight" });
      expect(getTab("2")).toHaveFocus();
      expect(getTab("One")).toHaveAttribute("aria-selected", "true");

      // Focus wraps at the ends
      fireEvent.keyDown(getTab("2"), { key: "ArrowRight" });
      expect(getTab("One")).toHaveFocus();
      fireEvent.keyDown(getTab("One"), { key: "End" });
      expect(getTab("2")).toHaveFocus();

      fireEvent.keyDown(getTab("2"), { key: "Enter" });
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(getTab("2"), { key: "Home" });
      fireEvent.keyDown(getTab("One"), { key: " " });
      expect(getTab("One")).toHaveAttribute("aria-selected", "true");
    });

    test("Delete closes the focused tab and focuses its neighbor", () => {
      const { onModelChanged } = renderWorkspace();

      act(() => getTab("One").focus());
      fireEvent.keyDown(getTab("One"), { key: "Delete" });

      expect(screen.queryByRole("tab", { name: /^One/ })).toBeNull();
      expect(getTab("2")).toHaveFocus();
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "close"
      });
    });

    test("keys within interactive descendants are ignored", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            <input data-tab-ignore data-testid={`input-${tab.id}`} />
          </div>
        )
      });

      fireEvent.keyDown(screen.getByTestId("input-1"), { key: "Backspace" });
      expect(screen.getByTestId("input-1")).toBeInTheDocument();
    });

    test("Delete is ignored when closing is disabled", () => {
      renderWorkspace({ disabled: true });

      fireEvent.keyDown(getTab("One"), { key: "Delete" });
      expect(getTab("One")).toBeInTheDocument();
    });
  });

  describe("imperative API", () => {
    test("moving a tab does not remount its content", () => {
      let mountCount = 0;

      function Counter() {
        const [count, setCount] = useState(0);
        useEffect(() => {
          mountCount++;
        }, []);
        return (
          <button data-testid="counter" onClick={() => setCount(count + 1)}>
            {count}
          </button>
        );
      }

      const { workspaceRef } = renderWorkspace({
        renderTabContent: () => <Counter />
      });

      const counter = () => screen.getAllByTestId("counter")[0];
      fireEvent.click(counter());
      expect(counter()).toHaveTextContent("1");
      expect(mountCount).toBe(3);

      // Moving into another tabset and splitting a tabset both restructure the layout
      act(() => {
        workspaceRef.current!.moveTab("1", {
          region: "center",
          tabsetId: "right"
        });
      });
      act(() => {
        workspaceRef.current!.moveTab("1", {
          region: "bottom",
          tabsetId: "right"
        });
      });

      expect(screen.getAllByTestId("counter")).toHaveLength(3);
      expect(mountCount).toBe(3);
      expect(
        screen
          .getAllByTestId("counter")
          .some((element) => element.textContent === "1")
      ).toBe(true);
    });

    test("addTab adds to the active tabset, or selects an existing tab", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace();

      // The user interacts with the right tabset, making it active
      fireEvent.pointerDown(
        container.querySelector('[data-tabset-id="right"] [data-tab-panels]')!
      );
      expect(workspaceRef.current!.getActiveTabsetId()).toBe("right");

      let added: boolean = false;
      act(() => {
        added = workspaceRef.current!.addTab(tab("4"));
      });
      expect(added).toBe(true);
      expect(
        container.querySelector('[data-tabset-id="right"]')
      ).toContainElement(getTab("4"));
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "add"
      });

      act(() => {
        added = workspaceRef.current!.addTab(tab("2"));
      });
      expect(added).toBe(false);
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "select"
      });
    });

    test("splitting a tabset does not remount other tabsets", () => {
      const mountCounts: { [tabsetId: string]: number } = {};

      function MountCounter({ tabsetId }: { tabsetId: string }) {
        useEffect(() => {
          mountCounts[tabsetId] = (mountCounts[tabsetId] ?? 0) + 1;
        }, [tabsetId]);
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        renderTabsetToolbar: (tabset) => <MountCounter tabsetId={tabset.id} />
      });
      expect(mountCounts).toEqual({ left: 1, right: 1 });

      // The root split's children change (the right tabset is replaced by a new split)
      act(() => {
        workspaceRef.current!.moveTab("2", {
          region: "bottom",
          tabsetId: "right"
        });
      });

      expect(mountCounts.left).toBe(1);
    });

    test("setModel replaces and normalizes the model", () => {
      const { onModelChanged, workspaceRef } = renderWorkspace();

      let applied: WorkspaceModel | undefined;
      act(() => {
        applied = workspaceRef.current!.setModel({
          root: {
            children: [{ id: "a", tabs: [tab("9")], type: "tabset" }],
            id: "root",
            orientation: "horizontal",
            type: "split"
          },
          version: 1
        });
      });

      // A split with a single child is replaced by the child
      expect(applied?.root).toMatchObject({ id: "a", selectedId: "9" });
      expect(workspaceRef.current!.getModel()).toBe(applied);
      expect(getTab("9")).toBeInTheDocument();
      expect(onModelChanged).toHaveBeenLastCalledWith(applied, {
        isUserInteraction: false,
        reason: "set-model"
      });
    });

    test("updateTab renames a tab", () => {
      const { workspaceRef } = renderWorkspace();

      act(() => {
        workspaceRef.current!.updateTab("2", { title: "Two" });
      });
      expect(getTab("Two")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Close Two" })
      ).toBeInTheDocument();
    });

    test("maximizeTabset covers the rest of the layout", () => {
      const { container, workspaceRef } = renderWorkspace();

      act(() => {
        workspaceRef.current!.maximizeTabset("left");
      });

      const maximized = container.querySelector("[data-workspace-maximized]")!;
      expect(
        maximized.querySelector('[data-tabset-id="left"]')
      ).toHaveAttribute("data-tabset-maximized");
      expect(
        container.querySelectorAll('[data-tabset-id="left"]')
      ).toHaveLength(1);
      expect(
        container.querySelector("[data-workspace-layout]")
      ).toHaveAttribute("inert");
      expect(workspaceRef.current!.getModel().maximizedTabsetId).toBe("left");

      // Content moves into the maximized tabset
      expect(maximized).toContainElement(screen.getByTestId("content-1"));

      act(() => {
        workspaceRef.current!.restoreTabset();
      });
      expect(container.querySelector("[data-workspace-maximized]")).toBeNull();
      expect(
        container.querySelector("[data-workspace-layout]")
      ).not.toHaveAttribute("inert");
      expect(
        container.querySelector('[data-tabset-id="left"] [data-tab-panels]')
      ).toContainElement(screen.getByTestId("content-1"));
    });
  });

  describe("tabRemovalSelectionBehavior", () => {
    function createThreeTabModel(): WorkspaceModel<TabData> {
      return {
        root: {
          id: "only",
          selectedId: "1",
          tabs: [tab("1", { title: "One" }), tab("2"), tab("3")],
          type: "tabset"
        },
        version: 1
      };
    }

    function getCloseButton(name: string) {
      return screen.getByRole("button", { name: `Close ${name}` });
    }

    test("adjacent (default) selects the tab after the closed one, and doesn't save recently selected tabs", async () => {
      const { workspaceRef } = renderWorkspace({
        defaultModel: createThreeTabModel()
      });

      await userEvent.click(getTab("2"));
      await userEvent.click(getCloseButton("2"));

      expect(getTab("3")).toHaveAttribute("aria-selected", "true");
      expect(workspaceRef.current!.getModel().root).not.toHaveProperty(
        "recentTabIds"
      );
    });

    test("recent selects the most recently selected tab, and saves recently selected tabs", async () => {
      const { onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createThreeTabModel(),
        tabRemovalSelectionBehavior: "recent"
      });
      expect(workspaceRef.current!.getModel().root).toMatchObject({
        recentTabIds: ["1"]
      });

      await userEvent.click(getTab("2"));
      expect(onModelChanged).toHaveBeenLastCalledWith(
        expect.objectContaining({
          root: expect.objectContaining({ recentTabIds: ["2", "1"] })
        }),
        { isUserInteraction: true, reason: "select" }
      );

      await userEvent.click(getCloseButton("2"));

      expect(getTab("One")).toHaveAttribute("aria-selected", "true");
      expect(workspaceRef.current!.getModel().root).toMatchObject({
        recentTabIds: ["1"]
      });
    });

    test("recent applies to the imperative API", () => {
      const { workspaceRef } = renderWorkspace({
        defaultModel: createThreeTabModel(),
        tabRemovalSelectionBehavior: "recent"
      });

      act(() => {
        workspaceRef.current!.selectTab("2");
        workspaceRef.current!.closeTab("2");
      });

      expect(getTab("One")).toHaveAttribute("aria-selected", "true");
    });

    test("Delete moves focus to the tab that is selected instead", async () => {
      renderWorkspace({
        defaultModel: createThreeTabModel(),
        tabRemovalSelectionBehavior: "recent"
      });

      await userEvent.click(getTab("2"));
      await userEvent.keyboard("{Delete}");

      expect(getTab("One")).toHaveFocus();
      expect(getTab("One")).toHaveAttribute("aria-selected", "true");
    });

    test("changing the behavior to adjacent forgets recently selected tabs", async () => {
      const props: Partial<WorkspaceProps<TabData>> = {
        defaultModel: createThreeTabModel(),
        renderTabContent: (tab) => <Content tab={tab} />
      };
      const { rerender, workspaceRef } = renderWorkspace({
        ...props,
        tabRemovalSelectionBehavior: "recent"
      });
      await userEvent.click(getTab("2"));

      rerender(
        <Workspace<TabData>
          {...(props as WorkspaceProps<TabData>)}
          tabRemovalSelectionBehavior="adjacent"
          workspaceRef={workspaceRef}
        />
      );
      await userEvent.click(getCloseButton("2"));

      expect(getTab("3")).toHaveAttribute("aria-selected", "true");
      expect(workspaceRef.current!.getModel().root).not.toHaveProperty(
        "recentTabIds"
      );
    });
  });

  describe("collapsing tabsets", () => {
    function createCollapsibleModel(
      collapsed: boolean
    ): WorkspaceModel<TabData> {
      const model = createModel();
      const root = model.root as SplitNode<TabData>;

      return {
        ...model,
        root: {
          ...root,
          children: [
            {
              ...(root.children[0] as TabsetNode<TabData>),
              collapsed,
              collapsible: true
            },
            root.children[1]
          ]
        }
      };
    }

    function getTabset(container: HTMLElement, id: string) {
      return container.querySelector<HTMLElement>(
        `[data-workspace-layout] [data-tabset-id="${id}"]`
      )!;
    }

    test("selecting a tab in a maximized collapsed tabset doesn't expand it (it's still collapsed when restored)", async () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createCollapsibleModel(true)
      });

      act(() => {
        workspaceRef.current!.maximizeTabset("left");
      });
      onModelChanged.mockClear();

      // The maximized tabset is shown expanded (in the overlay)
      const overlay = container.querySelector<HTMLElement>(
        "[data-workspace-maximized]"
      )!;
      const tab = overlay.querySelector<HTMLElement>('[data-tab-id="2"]')!;
      await userEvent.click(tab);

      expect(onModelChanged).toHaveBeenCalledTimes(1);
      expect(onModelChanged.mock.lastCall![1]).toEqual({
        isUserInteraction: true,
        reason: "select"
      });

      act(() => {
        workspaceRef.current!.restoreTabset();
      });
      expect(getTabset(container, "left")).toHaveAttribute(
        "data-tabset-collapsed"
      );
    });

    test("a collapsed tabset hides its panels (keeping its content mounted) and shows its header along its split", () => {
      const { container } = renderWorkspace({
        defaultModel: createCollapsibleModel(true)
      });

      const tabset = getTabset(container, "left");
      expect(tabset).toHaveAttribute("data-tabset-collapsed");
      expect(tabset.querySelector("[data-tab-panels]")).toHaveStyle({
        display: "none"
      });
      expect(screen.getByTestId("content-1")).toBeInTheDocument();

      // Tabs placed on top run vertically while the tabset is collapsed within a horizontal split
      expect(tabset).toHaveAttribute("data-tab-placement", "left");
      expect(tabset.querySelector("[data-tab-list]")).toHaveAttribute(
        "aria-orientation",
        "vertical"
      );
      expect(getTabset(container, "right")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );
    });

    test("clicking a tab in a collapsed tabset expands it and selects the tab", async () => {
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: createCollapsibleModel(true)
      });

      await userEvent.click(getTab("2"));

      expect(getTabset(container, "left")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
      expect(onModelChanged).toHaveBeenCalledTimes(1);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "expand"
      });
    });

    test("clicking the empty space in a collapsed tabset's header expands it", async () => {
      const { container } = renderWorkspace({
        defaultModel: createCollapsibleModel(true)
      });

      await userEvent.click(
        getTabset(container, "left").querySelector("[data-tab-list]")!
      );

      expect(getTabset(container, "left")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );
    });

    test("the imperative API collapses and expands collapsible tabsets", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createCollapsibleModel(false)
      });

      // Not collapsible
      act(() => workspaceRef.current!.collapseTabset("right"));
      expect(onModelChanged).not.toHaveBeenCalled();

      act(() => workspaceRef.current!.collapseTabset("left"));
      expect(getTabset(container, "left")).toHaveAttribute(
        "data-tabset-collapsed"
      );
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "collapse"
      });

      act(() => workspaceRef.current!.expandTabset("left"));
      expect(getTabset(container, "left")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "expand"
      });
    });

    test("hooks report whether a tabset is collapsed, and its content isn't visible", () => {
      const tabsetStates: { [id: string]: ParentTabsetState | null } = {};
      const tabStates: { [id: string]: ParentTabState | null } = {};
      function TabsetState() {
        const tabset = useParentTabset();
        tabsetStates[tabset!.id] = useParentTabsetState();
        return null;
      }
      function TabState() {
        const tab = useParentTab();
        tabStates[tab!.id] = useParentTabState();
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        defaultModel: createCollapsibleModel(false),
        renderTabContent: () => <TabState />,
        renderTabsetToolbar: () => <TabsetState />
      });
      expect(tabsetStates.left).toMatchObject({
        isCollapsed: false,
        isCollapsible: true
      });
      expect(tabsetStates.right).toMatchObject({ isCollapsible: false });
      expect(tabStates["1"]).toMatchObject({ isVisible: true });

      act(() => workspaceRef.current!.collapseTabset("left"));
      expect(tabsetStates.left).toMatchObject({
        isCollapsed: true,
        isCollapsible: true
      });
      expect(tabStates["1"]).toMatchObject({
        isSelected: true,
        isVisible: false
      });

      // A maximized tabset is shown expanded
      act(() => workspaceRef.current!.maximizeTabset("left"));
      expect(tabStates["1"]).toMatchObject({ isVisible: true });
    });

    test("a maximized collapsed tabset is shown expanded, and is collapsed again when restored", () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createCollapsibleModel(true)
      });

      act(() => workspaceRef.current!.maximizeTabset("left"));
      const overlay = container.querySelector<HTMLElement>(
        '[data-workspace-maximized] [data-tabset-id="left"]'
      )!;
      expect(overlay).not.toHaveAttribute("data-tabset-collapsed");
      expect(overlay).toHaveAttribute("data-tab-placement", "top");

      act(() => workspaceRef.current!.restoreTabset());
      expect(getTabset(container, "left")).toHaveAttribute(
        "data-tabset-collapsed"
      );
    });
  });

  describe("hiddenTabBehavior", () => {
    function EffectLogger({ id, log }: { id: string; log: string[] }) {
      useEffect(() => {
        log.push(`mount ${id}`);
        return () => {
          log.push(`unmount ${id}`);
        };
      }, [id, log]);
      return <div data-testid={`content-${id}`} />;
    }

    test("unmount", () => {
      const log: string[] = [];
      renderWorkspace({
        hiddenTabBehavior: "unmount",
        renderTabContent: (tab) => <EffectLogger id={tab.id} log={log} />
      });

      expect(screen.queryByTestId("content-2")).toBeNull();

      fireEvent.click(getTab("2"));
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
      expect(screen.queryByTestId("content-1")).toBeNull();
      expect(log).toContain("unmount 1");
    });

    test("activity", () => {
      const log: string[] = [];
      renderWorkspace({
        hiddenTabBehavior: "activity",
        renderTabContent: (tab) => <EffectLogger id={tab.id} log={log} />
      });

      // Hidden content is rendered, but its effects are not mounted
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
      expect(log).not.toContain("mount 2");

      fireEvent.click(getTab("2"));
      expect(log).toContain("mount 2");
      expect(log).toContain("unmount 1");
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
    });

    test("function", () => {
      renderWorkspace({
        hiddenTabBehavior: (tab) =>
          tab.id === "2" ? "unmount" : "keep-mounted"
      });

      expect(screen.queryByTestId("content-2")).toBeNull();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();
    });
  });

  describe("hooks", () => {
    test("tab content can access its tab, tabset, and workspace", () => {
      const handles: ParentTab[] = [];

      function TabInfo() {
        const parentTab = useParentTab();
        const state = useParentTabState();
        const tabset = useParentTabset();
        const workspace = useParentWorkspace();

        if (parentTab?.id === "1") {
          handles.push(parentTab);
        }

        return (
          <div data-testid={`info-${parentTab?.id}`}>
            {JSON.stringify({
              ...state,
              tabsetId2: tabset?.id,
              workspaceId: workspace?.id
            })}
          </div>
        );
      }

      const { workspaceRef } = renderWorkspace({
        id: "workspace",
        renderTabContent: () => <TabInfo />
      });

      const info = (id: string) =>
        JSON.parse(screen.getByTestId(`info-${id}`).textContent!);

      expect(info("1")).toEqual({
        isCloseDisabled: false,
        isDragDisabled: false,
        isSelected: true,
        isVisible: true,
        tabsetId: "left",
        tabsetId2: "left",
        workspaceId: "workspace"
      });
      expect(info("2")).toMatchObject({ isSelected: false, isVisible: false });

      act(() => {
        workspaceRef.current!.maximizeTabset("right");
      });

      // Selected, but covered by the maximized tabset
      expect(info("1")).toMatchObject({ isSelected: true, isVisible: false });
      expect(info("3")).toMatchObject({ isSelected: true, isVisible: true });

      act(() => {
        workspaceRef.current!.moveTab("1", { index: 0, tabsetId: "right" });
      });
      expect(info("1")).toMatchObject({
        tabsetId: "right",
        tabsetId2: "right"
      });

      // The tab handle is stable, and its methods read current values
      expect(new Set(handles).size).toBe(1);
      expect(handles[0].getTabsetId()).toBe("right");
      expect(handles[0].isSelected()).toBe(true);
    });

    test("tabsets and tab content see the Panel outside of the Workspace", () => {
      function ParentPanelId({ label }: { label: string }) {
        const panel = useParentPanel();
        return <div data-testid={label}>{panel ? panel.id : "none"}</div>;
      }

      const props: WorkspaceProps<TabData> = {
        defaultModel: createModel(),
        renderTabContent: (tab) => (
          <ParentPanelId label={`content-${tab.id}`} />
        ),
        renderTabsetToolbar: (tabset) => (
          <ParentPanelId label={`tabset-${tabset.id}`} />
        )
      };

      const { rerender } = render(
        <Group>
          <Panel id="outer">
            <Workspace<TabData> {...props} />
          </Panel>
        </Group>
      );

      expect(screen.getByTestId("tabset-left")).toHaveTextContent("outer");
      expect(screen.getByTestId("content-1")).toHaveTextContent("outer");

      rerender(<Workspace<TabData> {...props} />);

      expect(screen.getByTestId("tabset-left")).toHaveTextContent("none");
      expect(screen.getByTestId("content-1")).toHaveTextContent("none");
    });

    test("tabsets of a Workspace within a tab don't see the outer tab", () => {
      function ParentTabId() {
        const parentTab = useParentTab();
        return <div data-testid="inner-tabset">{parentTab?.id ?? "none"}</div>;
      }

      renderWorkspace({
        renderTabContent: (outerTab) =>
          outerTab.id === "1" ? (
            <Workspace
              defaultModel={{
                root: { id: "inner", tabs: [tab("inner-tab")], type: "tabset" },
                version: 1
              }}
              renderTabContent={() => null}
              renderTabsetToolbar={() => <ParentTabId />}
            />
          ) : null
      });

      expect(screen.getByTestId("inner-tabset")).toHaveTextContent("none");
    });

    test("useParentTabsetState only changes when the tabset's state does", () => {
      const states: unknown[] = [];

      function TabsetState() {
        const state = useParentTabsetState();
        useEffect(() => {
          states.push(state);
        }, [state]);
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "1" ? <TabsetState /> : null)
      });
      expect(states).toHaveLength(1);

      // Changes to another tabset replace the model (and every tabset object in it)
      act(() => {
        workspaceRef.current!.updateTab("3", { title: "Three" });
      });
      expect(states).toHaveLength(1);

      act(() => {
        workspaceRef.current!.selectTab("2");
      });
      expect(states).toHaveLength(2);
    });

    test("useParentTabState returns the state of a new tab on its first render", () => {
      const states: (ParentTabState | null)[] = [];
      function TabState() {
        states.push(useParentTabState());
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "4" ? <TabState /> : null)
      });

      act(() => {
        workspaceRef.current!.addTab(tab("4"));
      });

      expect(states.length).toBeGreaterThan(0);
      expect(states[0]).not.toBeNull();
    });

    test("useParentTabState only re-renders when the tab's state changes", () => {
      const { TabState, getRenderCount } = createTabStateCounter();

      const { workspaceRef } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "1" ? <TabState /> : null)
      });
      const initialRenderCount = getRenderCount();

      // Changes to other tabsets don't affect this tab
      act(() => {
        workspaceRef.current!.updateTab("3", { title: "Three" });
      });
      expect(getRenderCount()).toBe(initialRenderCount);

      act(() => {
        workspaceRef.current!.selectTab("2");
      });
      expect(getRenderCount()).toBe(initialRenderCount + 1);
    });

    test("closing from tab content is not a user interaction", () => {
      function CloseButton() {
        const parentTab = useParentTab();
        return (
          <button onClick={() => parentTab?.close()}>
            close {parentTab?.id}
          </button>
        );
      }

      const { onModelChanged } = renderWorkspace({
        renderTabContent: () => <CloseButton />
      });

      fireEvent.click(screen.getByRole("button", { name: "close 1" }));
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "close"
      });
    });
  });

  describe("tab list free space", () => {
    // jsdom doesn't lay out elements; tab lists are 300px wide, and their tabs aren't laid out (so they take no space)
    beforeEach(() => {
      const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      vi.spyOn(
        HTMLElement.prototype,
        "getBoundingClientRect"
      ).mockImplementation(function (this: HTMLElement) {
        return this.hasAttribute("data-tab-list")
          ? DOMRect.fromRect({ height: 30, width: 300, x: 0, y: 0 })
          : getBoundingClientRect.call(this);
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("is reported by the imperative API, a custom property, and useTabListFreeSpace", async () => {
      function FreeSpace() {
        const tabset = useParentTabset();
        return (
          <div data-testid={`free-space-${tabset?.id}`}>
            {String(useTabListFreeSpace())}
          </div>
        );
      }

      const { container, workspaceRef } = renderWorkspace({
        renderTabsetToolbar: () => <FreeSpace />
      });

      // Tab lists are first measured after the commit (but before the browser paints)
      expect(workspaceRef.current!.getTabListFreeSpace("left")).toBe(undefined);
      await act(async () => {});

      expect(workspaceRef.current!.getTabListFreeSpace("left")).toBe(300);
      expect(workspaceRef.current!.getTabListFreeSpace("missing")).toBe(
        undefined
      );
      expect(
        container
          .querySelector<HTMLElement>(
            '[data-tabset-id="left"] [data-tab-list]'
          )!
          .style.getPropertyValue("--tab-list-free-space")
      ).toBe("300px");
      expect(screen.getByTestId("free-space-left")).toHaveTextContent("300");
    });

    test("useTabListFreeSpace returns undefined outside of a tabset", () => {
      function FreeSpace() {
        return (
          <div data-testid="free-space">{String(useTabListFreeSpace())}</div>
        );
      }

      render(<FreeSpace />);
      expect(screen.getByTestId("free-space")).toHaveTextContent("undefined");
    });

    test("notifies subscribers when it changes, and when the tabset is removed", async () => {
      const { workspaceRef } = renderWorkspace();
      // Tab lists are first measured after the commit (but before the browser paints)
      await act(async () => {});
      const listener = vi.fn();
      const unsubscribe = workspaceRef.current!.subscribeToTabListFreeSpace(
        "right",
        listener
      );

      // Maximizing (and restoring) a tabset moves its tab list, but its free space doesn't change
      act(() => {
        workspaceRef.current!.maximizeTabset("right");
      });
      await act(async () => {});
      act(() => {
        workspaceRef.current!.restoreTabset();
      });
      await act(async () => {});
      expect(listener).not.toHaveBeenCalled();

      act(() => {
        workspaceRef.current!.closeTabset("right");
      });
      await act(async () => {});
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenLastCalledWith(undefined);
      expect(workspaceRef.current!.getTabListFreeSpace("right")).toBe(
        undefined
      );

      unsubscribe();
    });
  });

  describe("tab list overflow", () => {
    // jsdom doesn't lay out elements; tab lists are 150px wide, and their tabs are 100px wide, side by side (offset by how far the list is scrolled)
    const scrollOffsets = new Map<Element, number>();
    let listWidth = 150;

    function getRect(element: HTMLElement): DOMRect | undefined {
      if (element.hasAttribute("data-tab-list")) {
        return DOMRect.fromRect({ height: 30, width: listWidth, x: 0, y: 0 });
      }

      const list = element.closest("[data-tab-list]");
      if (element.hasAttribute("data-tab") && list) {
        const index = Array.from(list.querySelectorAll("[data-tab]")).indexOf(
          element
        );
        return DOMRect.fromRect({
          height: 30,
          width: 100,
          x: index * 100 - (scrollOffsets.get(list) ?? 0),
          y: 0
        });
      }
    }

    // Scrolls a list (as the user would), and dispatches its scroll event
    function scrollList(list: Element, offset: number) {
      act(() => {
        scrollOffsets.set(list, offset);
        list.dispatchEvent(new Event("scroll"));
      });
    }

    beforeEach(() => {
      const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      vi.spyOn(
        HTMLElement.prototype,
        "getBoundingClientRect"
      ).mockImplementation(function (this: HTMLElement) {
        return getRect(this) ?? getBoundingClientRect.call(this);
      });
      const getClientRects = HTMLElement.prototype.getClientRects;
      vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(
        function (this: HTMLElement) {
          const rect = getRect(this);
          return rect
            ? ([rect] as unknown as DOMRectList)
            : getClientRects.call(this);
        }
      );
      const offsetWidth = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "offsetWidth"
      )!.get!;
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
        function (this: HTMLElement) {
          return this.hasAttribute("data-tab-list")
            ? listWidth
            : offsetWidth.call(this);
        }
      );
      Element.prototype.scrollBy = function (
        this: Element,
        options?: ScrollToOptions | number
      ) {
        const left = typeof options === "object" ? (options.left ?? 0) : 0;
        scrollOffsets.set(this, (scrollOffsets.get(this) ?? 0) + left);
        this.dispatchEvent(new Event("scroll"));
      } as Element["scrollBy"];
    });

    afterEach(() => {
      vi.restoreAllMocks();
      scrollOffsets.clear();
      listWidth = 150;
      delete (Element.prototype as Partial<Element>).scrollBy;
    });

    function createOverflowingModel(): WorkspaceModel<TabData> {
      return {
        root: {
          children: [
            {
              id: "left",
              selectedId: "1",
              tabs: [tab("1"), tab("2"), tab("3"), tab("4")],
              type: "tabset"
            },
            {
              id: "right",
              selectedId: "5",
              tabs: [tab("5")],
              type: "tabset"
            }
          ],
          id: "root",
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      };
    }

    function Overflow() {
      const tabset = useParentTabset();
      const hiddenTabIds = useTabListOverflow();
      const partlyHiddenTabIds = useTabListOverflow({
        includePartiallyVisible: true
      });
      return (
        <div data-testid={`overflow-${tabset?.id}`}>
          {hiddenTabIds.join(",")}|{partlyHiddenTabIds.join(",")}
        </div>
      );
    }

    function getTabList(container: HTMLElement, tabsetId: string) {
      return container.querySelector<HTMLElement>(
        `[data-tabset-id="${tabsetId}"] [data-tab-list]`
      )!;
    }

    test("is reported by the imperative API and useTabListOverflow", async () => {
      const { workspaceRef } = renderWorkspace({
        defaultModel: createOverflowingModel(),
        renderTabsetToolbar: () => <Overflow />
      });

      // Tab lists are first measured after the commit (but before the browser paints)
      expect(workspaceRef.current!.getTabListOverflow("left")).toBe(undefined);
      expect(screen.getByTestId("overflow-left")).toHaveTextContent("|");
      await act(async () => {});

      // Tab 2 is cut off by the end of the list, and tabs 3 and 4 are beyond it
      expect(workspaceRef.current!.getTabListOverflow("left")).toEqual([
        "3",
        "4"
      ]);
      expect(
        workspaceRef.current!.getTabListOverflow("left", {
          includePartiallyVisible: true
        })
      ).toEqual(["2", "3", "4"]);
      expect(screen.getByTestId("overflow-left")).toHaveTextContent(
        "3,4|2,3,4"
      );
      expect(screen.getByTestId("overflow-right")).toHaveTextContent("|");
      expect(workspaceRef.current!.getTabListOverflow("missing")).toBe(
        undefined
      );
    });

    test("is updated when the tab list is scrolled", async () => {
      const { container } = renderWorkspace({
        defaultModel: createOverflowingModel(),
        renderTabsetToolbar: () => <Overflow />
      });
      await act(async () => {});

      scrollList(getTabList(container, "left"), 200);
      expect(screen.getByTestId("overflow-left")).toHaveTextContent(
        "1,2|1,2,4"
      );
    });

    test("the selected tab is scrolled into view when it's selected", async () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createOverflowingModel(),
        renderTabsetToolbar: () => <Overflow />
      });
      await act(async () => {});

      // Scrolled just far enough to show all of tab 4
      act(() => {
        workspaceRef.current!.selectTab("4");
      });
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(250);
      expect(screen.getByTestId("overflow-left")).toHaveTextContent(
        "1,2|1,2,3"
      );

      // A tab that's already visible doesn't scroll the list
      act(() => {
        workspaceRef.current!.selectTab("3");
      });
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(200);
    });

    test("the selected tab is scrolled into view when the tab list is first rendered", () => {
      const defaultModel = createOverflowingModel();
      (defaultModel.root as SplitNode<TabData>).children[0] = {
        ...((defaultModel.root as SplitNode<TabData>)
          .children[0] as TabsetNode<TabData>),
        selectedId: "3"
      };

      const { container } = renderWorkspace({ defaultModel });
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(150);
    });

    test("the selected tab is scrolled into view once a tab list that had no size is measured", async () => {
      const defaultModel = createOverflowingModel();
      (defaultModel.root as SplitNode<TabData>).children[0] = {
        ...((defaultModel.root as SplitNode<TabData>)
          .children[0] as TabsetNode<TabData>),
        selectedId: "3"
      };

      listWidth = 0;
      const { container } = renderWorkspace({ defaultModel });
      await act(async () => {});
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(undefined);

      // The list is resized (e.g. its container is shown)
      listWidth = 150;
      act(() => {
        emitter.emit("change");
      });
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(150);

      // The list isn't scrolled again when it's resized afterward
      scrollList(getTabList(container, "left"), 0);
      act(() => {
        emitter.emit("change");
      });
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(0);
    });

    test("overflow survives the tabset being maximized and restored", async () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createOverflowingModel()
      });
      await act(async () => {});
      expect(workspaceRef.current!.getTabListOverflow("left")).toEqual([
        "3",
        "4"
      ]);

      const listener = vi.fn();
      const unsubscribe = workspaceRef.current!.subscribeToTabListOverflow(
        "left",
        listener
      );

      // The tab list is rendered again in the overlay
      act(() => {
        workspaceRef.current!.maximizeTabset("left");
      });
      await act(async () => {});
      expect(workspaceRef.current!.getTabListOverflow("left")).toEqual([
        "3",
        "4"
      ]);

      act(() => {
        workspaceRef.current!.selectTab("4");
      });
      const maximized = container.querySelector("[data-workspace-maximized]")!;
      const overlayList =
        maximized.querySelector<HTMLElement>("[data-tab-list]")!;
      expect(scrollOffsets.get(overlayList)).toBe(250);
      expect(workspaceRef.current!.getTabListOverflow("left")).toEqual([
        "1",
        "2"
      ]);

      act(() => {
        workspaceRef.current!.restoreTabset();
      });
      await act(async () => {});
      expect(container.querySelector("[data-workspace-maximized]")).toBeNull();
      expect(scrollOffsets.get(getTabList(container, "left"))).toBe(250);
      expect(workspaceRef.current!.getTabListOverflow("left")).toEqual([
        "1",
        "2"
      ]);
      expect(listener).not.toHaveBeenCalledWith(undefined);
      unsubscribe();
    });

    test("ParentTabset.selectTab selects tabs within the tabset", async () => {
      let parentTabset: ParentTabset | null = null;
      function Toolbar() {
        const tabset = useParentTabset();
        if (tabset?.id === "left") {
          parentTabset = tabset;
        }
        return null;
      }

      const { onModelChanged } = renderWorkspace({
        defaultModel: createOverflowingModel(),
        renderTabsetToolbar: () => <Toolbar />
      });

      // Tabs in other tabsets aren't selected
      act(() => {
        parentTabset!.selectTab("5");
        parentTabset!.selectTab("missing");
      });
      expect(onModelChanged).not.toHaveBeenCalled();

      act(() => {
        parentTabset!.selectTab("4");
      });
      expect(getTab("4")).toHaveAttribute("aria-selected", "true");
      expect(onModelChanged).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ reason: "select" })
      );
    });

    test("notifies subscribers when the requested tabs change, and when the tabset is removed", async () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: createOverflowingModel()
      });
      await act(async () => {});
      const listener = vi.fn();
      const unsubscribe = workspaceRef.current!.subscribeToTabListOverflow(
        "left",
        listener
      );
      const partialListener = vi.fn();
      const unsubscribePartial =
        workspaceRef.current!.subscribeToTabListOverflow(
          "left",
          partialListener,
          { includePartiallyVisible: true }
        );

      // Tab 1 is cut off once the list is scrolled at all, but tabs 3 and 4 are still the only ones entirely out of view
      scrollList(getTabList(container, "left"), 25);
      expect(listener).not.toHaveBeenCalled();
      expect(partialListener).toHaveBeenCalledTimes(1);
      expect(partialListener).toHaveBeenLastCalledWith(["1", "2", "3", "4"]);

      // Scrolling further without changing which tabs are out of view doesn't notify subscribers again
      scrollList(getTabList(container, "left"), 40);
      expect(partialListener).toHaveBeenCalledTimes(1);

      scrollList(getTabList(container, "left"), 100);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenLastCalledWith(["1", "4"]);
      expect(partialListener).toHaveBeenCalledTimes(2);
      expect(partialListener).toHaveBeenLastCalledWith(["1", "3", "4"]);

      act(() => {
        workspaceRef.current!.closeTabset("left");
      });
      await act(async () => {});
      expect(listener).toHaveBeenLastCalledWith(undefined);
      expect(partialListener).toHaveBeenLastCalledWith(undefined);
      expect(workspaceRef.current!.getTabListOverflow("left")).toBe(undefined);

      unsubscribe();
      unsubscribePartial();
    });

    test("useTabListOverflow returns the same array until the requested tabs change", async () => {
      const renders: string[][] = [];
      function Overflow() {
        const tabset = useParentTabset();
        const hiddenTabIds = useTabListOverflow();
        if (tabset?.id === "left") {
          renders.push(hiddenTabIds);
        }
        return null;
      }

      const { container } = renderWorkspace({
        defaultModel: createOverflowingModel(),
        renderTabsetToolbar: () => <Overflow />
      });
      await act(async () => {});
      const renderCount = renders.length;
      const lastTabIds = renders[renders.length - 1];

      // Only partly visible tabs change
      scrollList(getTabList(container, "left"), 25);
      expect(renders.length).toBe(renderCount);
      expect(lastTabIds).toEqual(["3", "4"]);

      scrollList(getTabList(container, "left"), 100);
      expect(renders.length).toBe(renderCount + 1);
      expect(renders[renders.length - 1]).toEqual(["1", "4"]);
    });

    test("useTabListOverflow reports no tabs outside of a tabset", () => {
      function Overflow() {
        const hiddenTabIds = useTabListOverflow();
        const partlyHiddenTabIds = useTabListOverflow({
          includePartiallyVisible: true
        });
        return (
          <div data-testid="overflow">
            {hiddenTabIds.length}|{partlyHiddenTabIds.length}
          </div>
        );
      }

      render(<Overflow />);
      expect(screen.getByTestId("overflow")).toHaveTextContent("0|0");
    });
  });

  describe("growDirection", () => {
    function createGrowingModel(): WorkspaceModel<TabData> {
      return {
        root: {
          children: [
            {
              id: "top",
              size: "200px",
              tabs: [tab("1"), tab("2")],
              type: "tabset"
            },
            { id: "middle", tabs: [tab("3")], type: "tabset" }
          ],
          id: "rows",
          orientation: "vertical",
          type: "split"
        },
        version: 1
      };
    }

    function getContent(container: HTMLElement) {
      return container.querySelector<HTMLElement>(
        "[data-workspace-grow-content]"
      )!;
    }

    function getContentSize(container: HTMLElement) {
      const content = getContent(container);
      return content.style.height || content.style.width;
    }

    function getHandles(container: HTMLElement) {
      return Array.from(
        container.querySelectorAll<HTMLElement>("[data-grow-handle]")
      );
    }

    function getSizes(workspaceRef: {
      current: { getModel: () => WorkspaceModel<TabData> } | null;
    }) {
      const { root } = workspaceRef.current!.getModel();
      return root.type === "split" && root.children.map(({ size }) => size);
    }

    // jsdom doesn't lay out elements; the last row's Panel is 300px, and tabsets are 150px
    beforeEach(() => {
      const offsetHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "offsetHeight"
      )!.get!;
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
        function (this: HTMLElement) {
          if (this.hasAttribute("data-panel")) {
            return 300;
          } else if (this.hasAttribute("data-tabset")) {
            return 150;
          }
          return offsetHeight.call(this);
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("the layout is as large as its rows, and rows without lengths get defaultGrowSize", () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultGrowSize: "250px",
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });

      expect(container.querySelector("[data-workspace]")).toHaveAttribute(
        "data-grow-direction",
        "vertical"
      );
      expect(container.querySelectorAll("[data-grow-item]")).toHaveLength(0);
      expect(container.querySelector("[data-panel]")).not.toBeNull();
      expect(getContentSize(container)).toBe("calc(450px)");
      expect(getSizes(workspaceRef)).toEqual(["200px", "250px"]);
    });

    test("the handle resizes only the last row", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });

      const handles = getHandles(container);
      expect(handles).toHaveLength(1);
      const [handle] = handles;
      expect(handle).toHaveAttribute("role", "separator");
      expect(handle).not.toHaveAttribute("data-separator");
      expect(handle).toHaveAttribute("aria-valuenow", "300");

      fireEvent.keyDown(handle!, { key: "ArrowDown" });
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "resize"
      });
      expect(getSizes(workspaceRef)).toEqual(["200px", "310px"]);
      expect(getContentSize(container)).toBe("calc(510px)");

      fireEvent.keyDown(handle!, { key: "ArrowUp", shiftKey: true });
      expect(getSizes(workspaceRef)).toEqual(["200px", "250px"]);
    });

    test("a new row takes the size of the tabset its tab came from", () => {
      const { workspaceRef } = renderWorkspace({
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });

      act(() => {
        workspaceRef.current!.moveTab("2", { edge: "bottom" });
      });

      const { root } = workspaceRef.current!.getModel();
      expect(root.type === "split" && root.children).toHaveLength(3);
      expect(root.type === "split" && root.children[2]!.size).toBe("150px");
    });

    // jsdom has no PointerEvent, so mouse events are given the pointer's id
    function firePointer(
      element: HTMLElement,
      type: "pointercancel" | "pointerdown" | "pointermove" | "pointerup",
      clientY: number,
      clientX = 0
    ) {
      const event = new MouseEvent(type, {
        bubbles: true,
        button: 0,
        clientX,
        clientY
      });
      Object.defineProperty(event, "pointerId", { value: 1 });
      act(() => {
        element.dispatchEvent(event);
      });
    }

    test("applies the maximum of the last row to the handle", () => {
      const { container } = renderWorkspace({
        defaultModel: {
          root: {
            children: [
              {
                id: "a",
                maxHeight: "200px",
                size: "100px",
                tabs: [tab("1")],
                type: "tabset"
              },
              {
                id: "b",
                maxHeight: "350px",
                size: "100px",
                tabs: [tab("2")],
                type: "tabset"
              }
            ],
            id: "rows",
            orientation: "vertical",
            type: "split"
          },
          version: 1
        },
        growDirection: "vertical"
      });

      const [handle] = getHandles(container);
      expect(handle).toHaveAttribute("aria-valuemax", "350");

      fireEvent.keyDown(handle!, { key: "ArrowDown", shiftKey: true });
      fireEvent.keyDown(handle!, { key: "ArrowDown", shiftKey: true });
      expect(handle).toHaveAttribute("aria-valuenow", "350");
    });

    test("dragging the handle resizes the last row, and canceling doesn't resize", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace({
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });
      const [handle] = getHandles(container);
      handle!.setPointerCapture = vi.fn();

      firePointer(handle!, "pointerdown", 100);
      expect(handle).toHaveAttribute("data-active");
      firePointer(handle!, "pointermove", 150);
      expect(getContentSize(container)).toBe("calc(550px)");
      expect(onModelChanged).not.toHaveBeenCalled();

      firePointer(handle!, "pointercancel", 150);
      expect(handle).not.toHaveAttribute("data-active");
      expect(getContentSize(container)).toBe("calc(500px)");
      expect(onModelChanged).not.toHaveBeenCalled();

      firePointer(handle!, "pointerdown", 100);
      firePointer(handle!, "pointermove", 150);
      firePointer(handle!, "pointerup", 150);
      expect(getSizes(workspaceRef)).toEqual(["200px", "350px"]);
    });

    test("disabled blocks the handle", () => {
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: createGrowingModel(),
        disabled: true,
        growDirection: "vertical"
      });
      const [handle] = getHandles(container);
      handle!.setPointerCapture = vi.fn();

      expect(handle).toHaveAttribute("aria-disabled", "true");
      expect(handle).not.toHaveAttribute("tabindex");

      fireEvent.keyDown(handle!, { key: "ArrowDown" });
      firePointer(handle!, "pointerdown", 100);
      firePointer(handle!, "pointermove", 150);
      firePointer(handle!, "pointerup", 150);
      expect(getContentSize(container)).toBe("calc(500px)");
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("disabling the workspace mid-drag ends the drag without resizing", () => {
      const { container, onModelChanged, rerender } = renderWorkspace({
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });
      const [handle] = getHandles(container);
      handle!.setPointerCapture = vi.fn();

      firePointer(handle!, "pointerdown", 100);
      firePointer(handle!, "pointermove", 150);
      expect(getContentSize(container)).toBe("calc(550px)");

      rerender(
        <Workspace<TabData>
          defaultModel={createGrowingModel()}
          disabled
          growDirection="vertical"
          renderTabContent={(tab) => <Content tab={tab} />}
        />
      );
      expect(getContentSize(container)).toBe("calc(500px)");

      firePointer(handle!, "pointerup", 150);
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("collapsing the last row mid-drag drops its preview and its handle", () => {
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: {
          root: {
            children: [
              { id: "top", size: "200px", tabs: [tab("1")], type: "tabset" },
              {
                collapsible: true,
                id: "middle",
                size: "250px",
                tabs: [tab("3")],
                type: "tabset"
              }
            ],
            id: "rows",
            orientation: "vertical",
            type: "split"
          },
          version: 1
        },
        growDirection: "vertical"
      });
      const [handle] = getHandles(container);
      handle!.setPointerCapture = vi.fn();

      firePointer(handle!, "pointerdown", 100);
      firePointer(handle!, "pointermove", 150);
      expect(getContentSize(container)).toBe("calc(550px)");

      act(() => workspaceRef.current!.collapseTabset("middle"));
      expect(getHandles(container)).toHaveLength(0);
      // A collapsed row is as large as its header, which jsdom measures as 0
      expect(getContentSize(container)).toBe("calc(200px)");
    });

    test("a collapsed last row has no handle, and is as large as its header", () => {
      const { container } = renderWorkspace({
        defaultModel: {
          root: {
            children: [
              { id: "top", size: "200px", tabs: [tab("1")], type: "tabset" },
              {
                collapsed: true,
                collapsible: true,
                id: "middle",
                size: "250px",
                tabs: [tab("3")],
                type: "tabset"
              }
            ],
            id: "rows",
            orientation: "vertical",
            type: "split"
          },
          version: 1
        },
        growDirection: "vertical"
      });

      expect(getHandles(container)).toHaveLength(0);
      expect(getContentSize(container)).toBe("calc(200px)");
    });

    test("a collapsed row that isn't last counts at its header size, and the last row has a handle", () => {
      const { container } = renderWorkspace({
        defaultModel: {
          root: {
            children: [
              {
                collapsed: true,
                collapsible: true,
                id: "top",
                size: "200px",
                tabs: [tab("1")],
                type: "tabset"
              },
              { id: "middle", size: "250px", tabs: [tab("3")], type: "tabset" }
            ],
            id: "rows",
            orientation: "vertical",
            type: "split"
          },
          version: 1
        },
        growDirection: "vertical"
      });

      expect(getHandles(container)).toHaveLength(1);
      expect(getContentSize(container)).toBe("calc(250px)");
    });

    test("reverses the pointer and arrow keys of columns in right-to-left text", () => {
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
        function (this: HTMLElement) {
          return this.hasAttribute("data-panel") ? 300 : 0;
        }
      );
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: {
          root: {
            children: [
              { id: "a", size: "200px", tabs: [tab("1")], type: "tabset" },
              { id: "b", size: "300px", tabs: [tab("2")], type: "tabset" }
            ],
            id: "columns",
            orientation: "horizontal",
            type: "split"
          },
          version: 1
        },
        growDirection: "horizontal",
        style: { direction: "rtl" }
      });
      const [handle] = getHandles(container);
      handle!.setPointerCapture = vi.fn();

      // Columns start at the right, so moving the pointer left makes the last one larger
      firePointer(handle!, "pointerdown", 0, 100);
      firePointer(handle!, "pointermove", 0, 70);
      firePointer(handle!, "pointerup", 0, 70);
      expect(getSizes(workspaceRef)).toEqual(["200px", "330px"]);

      fireEvent.keyDown(handle!, { key: "ArrowLeft" });
      // (the mocked column is always 300px wide)
      expect(getSizes(workspaceRef)).toEqual(["200px", "310px"]);
      fireEvent.keyDown(handle!, { key: "ArrowRight" });
      expect(getSizes(workspaceRef)).toEqual(["200px", "290px"]);
    });

    test("falls back to the default grow size, with a warning, if defaultGrowSize isn't a length", () => {
      resetWarnOnceForTest();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { container } = renderWorkspace({
        defaultGrowSize: "50%",
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });

      expect(getContentSize(container)).toBe("calc(500px)");
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("defaultGrowSize")
      );
    });

    test("warns if growDirection changes", () => {
      resetWarnOnceForTest();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { rerender } = renderWorkspace({
        defaultModel: createGrowingModel(),
        growDirection: "vertical"
      });
      expect(warn).not.toHaveBeenCalled();

      rerender(
        <Workspace<TabData>
          defaultModel={createGrowingModel()}
          growDirection="horizontal"
          renderTabContent={(tab) => <Content tab={tab} />}
        />
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("growDirection")
      );
    });

    test("a root that isn't a split in the same direction is a single row", () => {
      const { container } = renderWorkspace({
        defaultGrowSize: "320px",
        growDirection: "vertical"
      });

      expect(getContentSize(container)).toBe("calc(320px)");
      expect(getHandles(container)).toHaveLength(1);
    });

    test("renderGrowHandle content is rendered inside the handle", () => {
      const { container } = renderWorkspace({
        defaultModel: createGrowingModel(),
        growDirection: "vertical",
        renderGrowHandle: (orientation) => (
          <span data-testid="grip">{orientation}</span>
        )
      });

      const [handle] = getHandles(container);
      expect(handle).toContainElement(screen.getByTestId("grip"));
      expect(screen.getByTestId("grip")).toHaveTextContent("vertical");
    });
  });

  describe("dragging", () => {
    let elementAtPoint: Element | null = null;

    beforeEach(() => {
      document.elementFromPoint = () => elementAtPoint;
    });

    afterEach(() => {
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    });

    // Pointers are pressed away from the origin: jsdom has no layout, so every edge between tabsets is at (0, 0),
    // and pressing there would start resizing rather than dragging a tab
    async function drag(from: HTMLElement, to: HTMLElement) {
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

    function getPanels(container: HTMLElement, tabsetId: string) {
      const panels = container.querySelector<HTMLElement>(
        `[data-tabset-id="${tabsetId}"] [data-tab-panels]`
      )!;
      elementAtPoint = panels;
      return panels;
    }

    function getHeader(container: HTMLElement, tabsetId: string) {
      return container.querySelector<HTMLElement>(
        `[data-tabset-id="${tabsetId}"] [data-tabset-header]`
      )!;
    }

    test("dropping a tab onto another tabset moves it there", async () => {
      const { container, onModelChanged } = renderWorkspace();

      await drag(getTab("2"), getPanels(container, "right"));

      expect(
        container.querySelector('[data-tabset-id="right"]')
      ).toContainElement(getTab("2"));
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "move"
      });
    });

    test("a press that starts resizing (e.g. at the edge of a tabset without separators) doesn't also drag a tab", async () => {
      const { container, onModelChanged } = renderWorkspace({
        renderSeparator: () => null
      });

      // Resizing handles "pointerdown" events first (during the capture phase); jsdom has no layout, so this simulates a press on an edge
      const startResize = (event: PointerEvent) =>
        updateInteractionState({
          cursorFlags: 0,
          didPointerMove: false,
          hitRegions: [],
          initialLayoutMap: new Map(),
          ownerDocument: document,
          pointerDownAtPoint: { x: event.clientX, y: event.clientY },
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          previewLayoutMap: new Map(),
          previews: [],
          state: "active"
        });
      document.addEventListener("pointerdown", startResize, true);

      try {
        await drag(getTab("2"), getPanels(container, "right"));
      } finally {
        document.removeEventListener("pointerdown", startResize, true);
        updateInteractionState({ cursorFlags: 0, state: "inactive" });
      }

      expect(
        container.querySelector('[data-tabset-id="left"]')
      ).toContainElement(getTab("2"));
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("disableDrop rejects targets", async () => {
      const disableDrop = vi.fn(() => true);
      const { container, onModelChanged } = renderWorkspace({ disableDrop });

      await drag(getTab("2"), getPanels(container, "right"));

      expect(disableDrop).toHaveBeenCalledWith({
        model: expect.anything(),
        source: "local",
        tab: expect.objectContaining({ id: "2" }),
        target: { region: "center", tabsetId: "right" }
      });
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("dropping a tab at an edge of the workspace moves it beside all of the tabsets", async () => {
      const disableDrop = vi.fn(() => false);
      const { container, onModelChanged } = renderWorkspace({ disableDrop });

      // jsdom has no layout, so the workspace is given a size within the window (the tabsets' panels are still at the origin)
      const rootElement =
        container.querySelector<HTMLElement>("[data-workspace]")!;
      rootElement.getBoundingClientRect = () => new DOMRect(0, 0, 700, 700);
      rootElement.querySelector<HTMLElement>(
        "[data-workspace-layout]"
      )!.getBoundingClientRect = () => new DOMRect(0, 0, 700, 700);

      const user = userEvent.setup();
      await user.pointer([
        {
          coords: { clientX: 100, clientY: 100 },
          keys: "[MouseLeft>]",
          target: getTab("2")
        },
        {
          coords: { clientX: 350, clientY: 695 },
          target: getPanels(container, "right")
        }
      ]);

      const indicator = container.querySelector<HTMLElement>(
        "[data-drop-indicator]"
      )!;
      expect(indicator.dataset.edge).toBe("bottom");
      expect(indicator.dataset.region).toBeUndefined();
      expect(indicator.style.opacity).toBe("");
      expect(disableDrop).toHaveBeenLastCalledWith(
        expect.objectContaining({ target: { edge: "bottom" } })
      );

      await user.pointer({
        keys: "[/MouseLeft]",
        target: getPanels(container, "right")
      });

      expect(onModelChanged).toHaveBeenLastCalledWith(
        expect.objectContaining({
          root: expect.objectContaining({
            children: [
              expect.objectContaining({ orientation: "horizontal" }),
              expect.objectContaining({
                tabs: [expect.objectContaining({ id: "2" })]
              })
            ],
            orientation: "vertical"
          })
        }),
        { isUserInteraction: true, reason: "move" }
      );
    });

    // Starts dragging a tab over the "right" tabset (without releasing the pointer)
    async function startDrag(container: HTMLElement, tabElement: HTMLElement) {
      // A single instance tracks the pointer's state between calls
      const user = userEvent.setup();
      await user.pointer([
        {
          coords: { clientX: 100, clientY: 100 },
          keys: "[MouseLeft>]",
          target: tabElement
        },
        {
          coords: { clientX: 150, clientY: 150 },
          target: getPanels(container, "right")
        }
      ]);

      return user;
    }

    test("unmounting during a drag cancels it", async () => {
      const { container, onModelChanged, unmount } = renderWorkspace();

      const user = await startDrag(container, getTab("2"));
      unmount();
      await user.pointer({ keys: "[/MouseLeft]", target: document.body });

      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("the window losing focus during a drag cancels it", async () => {
      const { container, onModelChanged } = renderWorkspace();

      const user = await startDrag(container, getTab("2"));
      act(() => {
        window.dispatchEvent(new Event("blur"));
      });
      await user.pointer({ keys: "[/MouseLeft]", target: document.body });

      expect(onModelChanged).not.toHaveBeenCalled();
      expect(container.querySelector("[data-drag-preview]")).toBeNull();
    });

    test("a drag restores the body's user-select afterward", async () => {
      document.body.style.userSelect = "text";
      try {
        const { container } = renderWorkspace();

        const user = await startDrag(container, getTab("2"));
        expect(document.body.style.userSelect).toBe("none");

        await user.pointer({
          keys: "[/MouseLeft]",
          target: getPanels(container, "right")
        });
        expect(document.body.style.userSelect).toBe("text");
      } finally {
        document.body.style.userSelect = "";
      }
    });

    test("starting a drag during another one restores the body's user-select afterward", async () => {
      document.body.style.userSelect = "text";
      try {
        const { container } = renderWorkspace();
        const panels = getPanels(container, "right");

        // A mouse drag is interrupted by a touch drag
        // (user-event doesn't release a second touch pointer, so this can't use two touches)
        const user = await startDrag(container, getTab("2"));
        expect(document.body.style.userSelect).toBe("none");

        await user.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[TouchA>]",
            target: getTab("One")
          },
          {
            coords: { clientX: 150, clientY: 150 },
            pointerName: "TouchA",
            target: panels
          },
          { keys: "[/TouchA]", target: panels }
        ]);
        expect(document.body.style.userSelect).toBe("text");
      } finally {
        document.body.style.userSelect = "";
      }
    });

    test("tabs with disableDrag can't be dragged", async () => {
      const model = createModel();
      const { container, onModelChanged } = renderWorkspace({
        defaultModel: {
          ...model,
          root: {
            children: [
              {
                id: "left",
                tabs: [tab("1"), tab("2", { disableDrag: true })],
                type: "tabset"
              },
              { id: "right", tabs: [tab("3")], type: "tabset" }
            ],
            id: "root",
            orientation: "horizontal",
            type: "split"
          }
        }
      });

      await drag(getTab("2"), getPanels(container, "right"));
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("dropping a tab onto the center of its own tabset does nothing", async () => {
      const { container, onModelChanged } = renderWorkspace();

      await drag(getTab("One"), getPanels(container, "left"));

      expect(onModelChanged).not.toHaveBeenCalled();
      expect(
        Array.from(
          container.querySelectorAll('[data-tabset-id="left"] [data-tab]')
        )
      ).toEqual([getTab("One"), getTab("2")]);
    });

    test("Escape cancels a drag without reaching other listeners", async () => {
      const { container, onModelChanged } = renderWorkspace();
      const onKeyDown = vi.fn();
      document.addEventListener("keydown", onKeyDown);
      try {
        const user = await startDrag(container, getTab("2"));
        await user.keyboard("{Escape}");
        await user.pointer({
          keys: "[/MouseLeft]",
          target: getPanels(container, "right")
        });

        expect(onKeyDown).not.toHaveBeenCalled();
        expect(onModelChanged).not.toHaveBeenCalled();
      } finally {
        document.removeEventListener("keydown", onKeyDown);
      }
    });

    test("components using useParentTabState don't re-render while dragging", async () => {
      const { TabState, getRenderCount } = createTabStateCounter();

      const { container } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "1" ? <TabState /> : null)
      });
      const initialRenderCount = getRenderCount();

      await startDrag(container, getTab("2"));
      expect(container.querySelector("[data-drag-preview]")).not.toBeNull();
      expect(getRenderCount()).toBe(initialRenderCount);
    });

    test("only the tabs whose drag state changes re-render while dragging (not splits or other tabs)", async () => {
      const renderedTabIds: string[] = [];
      // Called each time a split renders
      const renderSeparator = vi.fn(() => null);

      const { container } = renderWorkspace({
        renderSeparator,
        renderTab: (tab, props) => {
          renderedTabIds.push(tab.id);
          return <div {...props}>{tab.id}</div>;
        }
      });
      // Pressing the tab makes its tabset active, which re-renders the workspace
      const user = userEvent.setup();
      await user.pointer({
        coords: { clientX: 100, clientY: 100 },
        keys: "[MouseLeft>]",
        target: getTab("2")
      });
      renderedTabIds.length = 0;
      renderSeparator.mockClear();

      // Starting the drag only re-renders the dragged tab (to mark it as dragged)
      await user.pointer({
        coords: { clientX: 150, clientY: 150 },
        target: getPanels(container, "right")
      });
      expect(container.querySelector("[data-drop-indicator]")).not.toBeNull();
      expect(new Set(renderedTabIds)).toEqual(new Set(["2"]));
      expect(renderSeparator).not.toHaveBeenCalled();
      renderedTabIds.length = 0;

      // Moving over the other tabset's tab list only re-renders the tab the drop is shown beside
      elementAtPoint = container.querySelector(
        '[data-tabset-id="left"] [data-tab-list]'
      );
      await user.pointer({
        coords: { clientX: 160, clientY: 160 },
        target: elementAtPoint!
      });
      expect(
        container.querySelector("[data-drop-before], [data-drop-after]")
      ).not.toBeNull();
      expect(renderedTabIds.length).toBeGreaterThan(0);
      expect(renderedTabIds).not.toContain("3");
      expect(renderSeparator).not.toHaveBeenCalled();

      await user.keyboard("{Escape}");
      await user.pointer({ keys: "[/MouseLeft]", target: elementAtPoint! });
    });

    test("the drop indicator is the same element for the whole drag, so it can be animated between tabsets", async () => {
      const { container } = renderWorkspace();
      const getIndicator = () =>
        container.querySelector<HTMLElement>("[data-drop-indicator]");

      // Over the center of the "right" tabset's panels
      const user = await startDrag(container, getTab("2"));
      const indicator = getIndicator()!;
      expect(indicator.dataset.region).toBe("center");
      expect(indicator.style.opacity).toBe("");
      // Rendered within the workspace's root element, rather than within a tabset's panels
      expect(indicator.closest("[data-tab-panels]")).toBeNull();
      expect(indicator.parentElement?.parentElement).toBe(
        container.querySelector("[data-workspace]")
      );

      // Over a tab list, it stays where it was but isn't shown
      const tabList = container.querySelector<HTMLElement>(
        '[data-tabset-id="left"] [data-tab-list]'
      )!;
      elementAtPoint = tabList;
      await user.pointer({
        coords: { clientX: 160, clientY: 160 },
        target: tabList
      });
      expect(getIndicator()).toBe(indicator);
      expect(indicator.dataset.region).toBeUndefined();
      expect(indicator.style.opacity).toBe("0");

      // Over the left edge of the "left" tabset's panels (jsdom has no layout, so every point is otherwise at the center)
      const panels = getPanels(container, "left");
      panels.getBoundingClientRect = () =>
        ({ height: 1000, left: 0, top: 0, width: 1000 }) as DOMRect;
      await user.pointer({
        coords: { clientX: 170, clientY: 170 },
        target: panels
      });
      expect(getIndicator()).toBe(indicator);
      expect(indicator.dataset.region).toBe("left");
      expect(indicator.style.opacity).toBe("");

      await user.pointer({ keys: "[/MouseLeft]", target: panels });
      expect(getIndicator()).toBeNull();
    });

    describe("auto-scrolling workspaces that grow", () => {
      let frames: Array<() => void>;
      let scrollBy: ReturnType<typeof vi.fn>;

      beforeEach(() => {
        frames = [];
        vi.spyOn(window, "requestAnimationFrame").mockImplementation(
          (callback) => {
            frames.push(() => callback(0));
            return frames.length;
          }
        );
        scrollBy = vi.fn();
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      // A source workspace that doesn't grow, and one that does, scrolling within a 300px tall container
      function renderGrowing({ growingDragGroup = "group" } = {}) {
        const result = render(
          <>
            <Workspace<TabData>
              defaultModel={createModel()}
              dragGroup="group"
              id="source"
              renderTabContent={(tab) => <Content tab={tab} />}
            />
            <div data-testid="scroller" style={{ overflowY: "auto" }}>
              <Workspace<TabData>
                defaultModel={{
                  root: {
                    id: "rows",
                    tabs: [tab("4")],
                    type: "tabset"
                  },
                  version: 1
                }}
                dragGroup={growingDragGroup}
                growDirection="vertical"
                id="growing"
                renderTabContent={(tab) => <Content tab={tab} />}
              />
            </div>
          </>
        );

        const scroller = screen.getByTestId("scroller");
        Object.defineProperty(scroller, "scrollHeight", { value: 1000 });
        Object.defineProperty(scroller, "offsetHeight", { value: 300 });
        scroller.getBoundingClientRect = () => new DOMRect(0, 0, 300, 300);
        scroller.scrollBy = scrollBy as never;

        return result;
      }

      // Touch input drags with pointer events, even between workspaces in a drag group
      async function dragTouch(from: HTMLElement, clientY: number) {
        await userEvent.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[TouchA>]",
            target: from
          },
          { coords: { clientX: 150, clientY }, pointerName: "TouchA" }
        ]);
      }

      function runFrames() {
        act(() => {
          frames.splice(0).forEach((frame) => frame());
        });
      }

      test("scrolls the workspace under the pointer, in the drag group", async () => {
        const { container } = renderGrowing();
        elementAtPoint = container.querySelector(
          "[data-workspace][data-grow-direction] [data-tab-panels]"
        );

        await dragTouch(getTab("One"), 290);
        runFrames();

        expect(scrollBy).toHaveBeenCalled();
      });

      test("doesn't scroll a workspace that isn't under the pointer", async () => {
        const { container } = renderGrowing();
        elementAtPoint = container.querySelector(
          '[data-tabset-id="right"] [data-tab-panels]'
        );

        await dragTouch(getTab("One"), 290);
        runFrames();

        expect(scrollBy).not.toHaveBeenCalled();
      });

      test("doesn't scroll a workspace in another drag group", async () => {
        const { container } = renderGrowing({ growingDragGroup: "other" });
        elementAtPoint = container.querySelector(
          "[data-workspace][data-grow-direction] [data-tab-panels]"
        );

        await dragTouch(getTab("One"), 290);
        runFrames();

        expect(scrollBy).not.toHaveBeenCalled();
      });
    });

    describe("between workspaces (dragGroup)", () => {
      allowTearOffDeprecationWarning();

      // Includes the type that identifies the drag from another page posted below (with the id "remote")
      function createDataTransfer(id = "remote") {
        return {
          dropEffect: "none",
          effectAllowed: "all",
          setData: vi.fn(),
          setDragImage: vi.fn(),
          types: [
            "application/x-react-resizable-panels-workspace",
            `application/x-react-resizable-panels-workspace;id=${id}`
          ]
        };
      }

      // jsdom doesn't implement DragEvent, so drag events are mouse events with a DataTransfer stand-in
      function fireDragEvent(
        type: string,
        target: Element,
        init: MouseEventInit = {},
        dataTransfer = createDataTransfer()
      ) {
        const event = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: 150,
          clientY: 150,
          composed: true,
          ...init
        });
        Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
        act(() => {
          target.dispatchEvent(event);
        });

        return event;
      }

      function renderWorkspaces(
        props: Partial<WorkspaceProps<TabData>> = {},
        otherProps: Partial<WorkspaceProps<TabData>> = {}
      ) {
        const onModelChanged = vi.fn();
        const onOtherModelChanged = vi.fn();

        const result = render(
          <>
            <Workspace<TabData>
              defaultModel={createModel()}
              dragGroup="group"
              id="main"
              onModelChanged={onModelChanged}
              renderTabContent={(tab) => <Content tab={tab} />}
              {...props}
            />
            <Workspace<TabData>
              defaultModel={{
                root: {
                  id: "other",
                  selectedId: "4",
                  tabs: [tab("4")],
                  type: "tabset"
                },
                version: 1
              }}
              dragGroup="group"
              id="other-workspace"
              onModelChanged={onOtherModelChanged}
              renderTabContent={(tab) => <Content tab={tab} />}
              {...otherProps}
            />
          </>
        );

        return { ...result, onModelChanged, onOtherModelChanged };
      }

      // The mouse is pressed (but not released) before the drag starts
      async function press(element: HTMLElement) {
        await userEvent.pointer({
          coords: { clientX: 100, clientY: 100 },
          keys: "[MouseLeft>]",
          target: element
        });
      }

      async function startDrag(element: HTMLElement) {
        await press(element);
        const dataTransfer = createDataTransfer();
        fireDragEvent("dragstart", element, {}, dataTransfer);

        return dataTransfer;
      }

      // Drops onto an element (which is also returned by elementFromPoint)
      function dropOnto(element: HTMLElement) {
        elementAtPoint = element;
        const dragOver = fireDragEvent("dragover", element);
        const drop = fireDragEvent("drop", element);

        return { dragOver, drop };
      }

      test("mouse drags use HTML drag and drop, with the browser's drag image hidden", async () => {
        renderWorkspaces();

        await press(getTab("2"));
        expect(getTab("2").draggable).toBe(true);

        const dataTransfer = createDataTransfer();
        fireDragEvent("dragstart", getTab("2"), {}, dataTransfer);
        expect(dataTransfer.effectAllowed).toBe("move");
        expect(dataTransfer.setDragImage).toHaveBeenCalledTimes(1);
        expect(getTab("2")).toHaveAttribute("data-tab-dragging");

        // One preview is shown in the document (by the workspace the drag started in)
        expect(document.querySelectorAll("[data-drag-preview]")).toHaveLength(
          1
        );

        fireDragEvent("dragend", getTab("2"));
        expect(getTab("2")).not.toHaveAttribute("draggable");
        expect(getTab("2")).not.toHaveAttribute("data-tab-dragging");
        expect(document.querySelector("[data-drag-preview]")).toBeNull();
      });

      test("drags started by elements within the tab (e.g. images) drag the tab", async () => {
        const { container } = renderWorkspaces();

        await press(getTab("2"));
        const image = document.createElement("img");
        getTab("2").append(image);
        fireDragEvent("dragstart", image);
        expect(getTab("2")).toHaveAttribute("data-tab-dragging");

        dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );
        expect(
          container.querySelector('[data-tabset-id="other"]')
        ).toContainElement(getTab("2"));
      });

      test("a canceled press doesn't leave the tab draggable", async () => {
        renderWorkspaces();

        await press(getTab("2"));
        expect(getTab("2")).toHaveAttribute("draggable", "true");
        fireEvent(document, new Event("pointercancel", { bubbles: true }));

        expect(getTab("2")).not.toHaveAttribute("draggable");
      });

      test("a press without a drag (e.g. a click) doesn't leave the tab draggable", async () => {
        renderWorkspaces();

        await userEvent.pointer({ keys: "[MouseLeft]", target: getTab("2") });

        expect(getTab("2")).not.toHaveAttribute("draggable");
      });

      test("a tab dropped into another workspace in the group is moved there", async () => {
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces();

        await startDrag(getTab("2"));
        const { dragOver, drop } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(dragOver.defaultPrevented).toBe(true);
        expect(drop.defaultPrevented).toBe(true);
        expect(
          container.querySelector('[data-tabset-id="other"]')
        ).toContainElement(getTab("2"));

        // Both workspaces report the change
        expect(onOtherModelChanged).toHaveBeenCalledTimes(1);
        expect(onOtherModelChanged).toHaveBeenLastCalledWith(
          expect.objectContaining({
            root: expect.objectContaining({
              selectedId: "2",
              tabs: [tab("4"), tab("2")]
            })
          }),
          { isUserInteraction: true, reason: "transfer" }
        );
        expect(onModelChanged).toHaveBeenCalledTimes(1);
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "transfer"
        });
        expect(screen.getAllByRole("tab", { name: /^2/ })).toHaveLength(1);
        expect(document.querySelector("[data-drag-preview]")).toBeNull();
      });

      test("the drop indicator is shown by the workspace the drag is over, even if another workspace shows the preview", async () => {
        const { container } = renderWorkspaces();
        const otherWorkspace = container.querySelector(
          '[data-workspace][id="other-workspace"]'
        )!;

        // The source shows the preview in this document
        await startDrag(getTab("2"));
        elementAtPoint = container.querySelector<HTMLElement>(
          '[data-tabset-id="other"] [data-tab-panels]'
        )!;
        fireDragEvent("dragover", elementAtPoint);

        expect(otherWorkspace.querySelector("[data-drag-preview]")).toBeNull();
        expect(
          otherWorkspace.querySelector<HTMLElement>("[data-drop-indicator]")
            ?.dataset.region
        ).toBe("center");

        fireDragEvent("dragend", getTab("2"));
        expect(
          otherWorkspace.querySelector("[data-drop-indicator]")
        ).toBeNull();
      });

      test("a whole tabset dropped into another workspace's tabset moves its tabs there", async () => {
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces();

        await startDrag(getHeader(container, "left"));
        dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(onOtherModelChanged).toHaveBeenLastCalledWith(
          expect.anything(),
          { isUserInteraction: true, reason: "transfer" }
        );
        expect(
          container.querySelector('[data-tabset-id="other"]')
        ).toContainElement(getTab("One"));
        expect(onModelChanged).toHaveBeenLastCalledWith(
          expect.objectContaining({
            root: expect.objectContaining({ id: "right" })
          }),
          { isUserInteraction: true, reason: "transfer" }
        );
      });

      test("a workspace's only tabset can be dragged into another workspace", async () => {
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces(
            {},
            {
              renderTabsetToolbar: () => (
                <TabsetDragHandle data-testid="other-handle" />
              )
            }
          );
        expect(screen.getByTestId("other-handle")).not.toHaveAttribute(
          "data-disabled"
        );

        // Pressing the handle makes the header draggable, so the browser dispatches dragstart there
        await press(screen.getByTestId("other-handle"));
        expect(getHeader(container, "other").draggable).toBe(true);
        fireDragEvent("dragstart", getHeader(container, "other"));
        dropOnto(getPanels(container, "right"));

        expect(
          container.querySelector('[data-tabset-id="right"]')
        ).toContainElement(getTab("4"));
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "transfer"
        });

        // Leaving its workspace with an empty root tabset
        expect(onOtherModelChanged).toHaveBeenLastCalledWith(
          expect.objectContaining({
            root: expect.objectContaining({ tabs: [] })
          }),
          { isUserInteraction: true, reason: "transfer" }
        );
      });

      test("a workspace's only tabset can't be dragged if it's kept when empty", () => {
        renderWorkspaces(
          {},
          {
            defaultModel: {
              root: {
                id: "other",
                keepWhenEmpty: true,
                tabs: [tab("4")],
                type: "tabset"
              },
              version: 1
            },
            renderTabsetToolbar: () => (
              <TabsetDragHandle data-testid="other-handle" />
            )
          }
        );

        expect(screen.getByTestId("other-handle")).toHaveAttribute(
          "data-disabled"
        );
      });

      test("tabs dropped within their own workspace are moved as usual", async () => {
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces();

        await startDrag(getTab("2"));
        dropOnto(getPanels(container, "right"));

        expect(
          container.querySelector('[data-tabset-id="right"]')
        ).toContainElement(getTab("2"));
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "move"
        });
        expect(onOtherModelChanged).not.toHaveBeenCalled();
      });

      test("disableDrop is told whether a tab comes from another workspace", async () => {
        const disableDrop = vi.fn(() => true);
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces({}, { disableDrop });

        await startDrag(getTab("2"));
        const { dragOver } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(disableDrop).toHaveBeenCalledWith({
          model: expect.anything(),
          source: "external",
          tab: tab("2"),
          tabset: undefined,
          target: { region: "center", tabsetId: "other" }
        });
        expect(dragOver.defaultPrevented).toBe(false);
        expect(onModelChanged).not.toHaveBeenCalled();
        expect(onOtherModelChanged).not.toHaveBeenCalled();
      });

      test("tabs can't be dropped into a workspace that has a tab with the same id", async () => {
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces(
            {},
            {
              defaultModel: {
                root: {
                  id: "other",
                  selectedId: "2",
                  tabs: [tab("2", { title: "Other 2" })],
                  type: "tabset"
                },
                version: 1
              }
            }
          );

        await startDrag(getTab("2"));
        const { dragOver } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(dragOver.defaultPrevented).toBe(false);
        expect(onModelChanged).not.toHaveBeenCalled();
        expect(onOtherModelChanged).not.toHaveBeenCalled();
      });

      test("tabsets with the keepWhenEmpty flag can't be dropped into another workspace", async () => {
        const model = createModel();
        (model.root as SplitNode<TabData>).children[0] = {
          ...((model.root as SplitNode<TabData>)
            .children[0] as TabsetNode<TabData>),
          keepWhenEmpty: true
        };
        const { container, onOtherModelChanged } = renderWorkspaces({
          defaultModel: model
        });

        await startDrag(getHeader(container, "left"));
        const { dragOver } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(dragOver.defaultPrevented).toBe(false);
        expect(onOtherModelChanged).not.toHaveBeenCalled();
      });

      test("disabled workspaces don't accept drops", async () => {
        const { container, onOtherModelChanged } = renderWorkspaces(
          {},
          { disabled: true }
        );

        await startDrag(getTab("2"));
        const { dragOver } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(dragOver.defaultPrevented).toBe(false);
        expect(onOtherModelChanged).not.toHaveBeenCalled();
        expect(
          container.querySelector('[data-tabset-id="other"]')
        ).not.toContainElement(getTab("2"));
      });

      test("a tabset can be dropped onto a tabset with the same id in another workspace", async () => {
        const { container, onOtherModelChanged } = renderWorkspaces(
          {},
          {
            defaultModel: {
              root: {
                id: "left",
                selectedId: "4",
                tabs: [tab("4")],
                type: "tabset"
              },
              version: 1
            }
          }
        );

        await startDrag(getHeader(container, "left"));
        const otherPanels = container.querySelectorAll<HTMLElement>(
          '[data-tabset-id="left"] [data-tab-panels]'
        )[1];
        const { dragOver } = dropOnto(otherPanels);

        expect(dragOver.defaultPrevented).toBe(true);
        expect(onOtherModelChanged).toHaveBeenLastCalledWith(
          expect.anything(),
          { isUserInteraction: true, reason: "transfer" }
        );
      });

      test("a tab removed during the drag can't be dropped into another workspace", async () => {
        const { container, onOtherModelChanged } = renderWorkspaces();

        await startDrag(getTab("2"));
        fireEvent.click(screen.getByRole("button", { name: "Close 2" }));
        expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();

        const { dragOver } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(dragOver.defaultPrevented).toBe(false);
        expect(onOtherModelChanged).not.toHaveBeenCalled();
        expect(document.querySelector("[data-drag-preview]")).toBeNull();
      });

      test("workspaces in other groups don't accept the drop", async () => {
        const { container, onOtherModelChanged } = renderWorkspaces(
          {},
          { dragGroup: "other-group" }
        );

        await startDrag(getTab("2"));
        const { dragOver } = dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(dragOver.defaultPrevented).toBe(false);
        expect(onOtherModelChanged).not.toHaveBeenCalled();
      });

      test("a drag that ends outside of every window is torn off", async () => {
        const now = vi.spyOn(Date, "now").mockReturnValue(1000);
        const onTearOff = vi.fn(() => true);
        const { container, onModelChanged } = renderWorkspaces({
          onTearOff
        });

        try {
          await startDrag(getTab("2"));

          // The last dragover before leaving the window is near its edge
          elementAtPoint = getPanels(container, "left");
          fireDragEvent("dragover", elementAtPoint, { clientX: 2 });

          now.mockReturnValue(2000);
          fireDragEvent("dragend", getTab("2"), { screenX: 50, screenY: 60 });
        } finally {
          now.mockRestore();
        }

        expect(onTearOff).toHaveBeenCalledWith(
          expect.objectContaining({
            screenX: 50,
            screenY: 60,
            tab: tab("2"),
            type: "tab"
          })
        );
        expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "tear-off"
        });
      });

      test("the last dragover's position is used if the dragend event's is wrong", async () => {
        const now = vi.spyOn(Date, "now").mockReturnValue(1000);
        const onTearOff = vi.fn(() => true);
        const { container } = renderWorkspaces({ onTearOff });

        try {
          await startDrag(getTab("2"));
          elementAtPoint = getPanels(container, "left");
          fireDragEvent("dragover", elementAtPoint, {
            clientX: 2,
            clientY: 30
          });

          now.mockReturnValue(2000);
          fireDragEvent("dragend", getTab("2"), { screenX: 0, screenY: 0 });
        } finally {
          now.mockRestore();
        }

        expect(onTearOff).toHaveBeenCalledWith(
          expect.objectContaining({
            screenX: window.screenX + 2,
            screenY: window.screenY + 30
          })
        );
      });

      test("a drag canceled within the window isn't torn off", async () => {
        const now = vi.spyOn(Date, "now").mockReturnValue(1000);
        const onTearOff = vi.fn(() => true);
        const { container } = renderWorkspaces({ onTearOff });

        try {
          await startDrag(getTab("2"));

          elementAtPoint = getPanels(container, "left");
          fireDragEvent("dragover", elementAtPoint, { clientX: 300 });

          // e.g. the drag image animating back after being released where it can't be dropped
          now.mockReturnValue(1600);
          fireDragEvent("dragend", getTab("2"));
        } finally {
          now.mockRestore();
        }

        expect(onTearOff).not.toHaveBeenCalled();
        expect(getTab("2")).toBeInTheDocument();
      });

      describe("between copies of the app", () => {
        type Message = { id: string; type: string; [key: string]: unknown };

        // Stands in for another page from the same origin (BroadcastChannels don't receive their own messages)
        let otherPage: BroadcastChannel;
        let messages: Message[];

        beforeEach(() => {
          messages = [];
          otherPage = new BroadcastChannel("react-resizable-panels-workspace");
          otherPage.onmessage = (event: MessageEvent<Message>) => {
            messages.push(event.data);
          };
        });

        afterEach(() => {
          otherPage.close();
        });

        // Messages are delivered asynchronously
        async function deliverMessages() {
          await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
        }

        function postFromOtherPage(message: Message) {
          otherPage.postMessage({ ...message, version: 1 });
        }

        function getOtherPanels(container: HTMLElement) {
          return container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!;
        }

        test("drags are shared with other pages", async () => {
          renderWorkspaces();

          await startDrag(getTab("2"));
          await deliverMessages();
          expect(messages).toEqual([
            {
              dragGroup: "group",
              id: expect.any(String),
              node: { tab: tab("2"), type: "tab" },
              source: { tabId: "2", type: "tab" },
              type: "start",
              version: 1
            }
          ]);

          fireDragEvent("dragend", getTab("2"));
          await deliverMessages();
          expect(messages[1]).toEqual({
            id: messages[0].id,
            type: "end",
            version: 1
          });
        });

        test("a tab dragged from another page is moved here when dropped", async () => {
          const { container, onOtherModelChanged } = renderWorkspaces();

          postFromOtherPage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            type: "start"
          });
          await deliverMessages();

          const { dragOver, drop } = dropOnto(getOtherPanels(container));
          expect(dragOver.defaultPrevented).toBe(true);
          expect(drop.defaultPrevented).toBe(true);
          expect(
            container.querySelector('[data-tabset-id="other"]')
          ).toContainElement(getTab("9"));
          expect(onOtherModelChanged).toHaveBeenLastCalledWith(
            expect.anything(),
            { isUserInteraction: true, reason: "transfer" }
          );

          // The other page is told to remove it
          await deliverMessages();
          expect(messages).toContainEqual({
            id: "remote",
            type: "remove",
            version: 1
          });
        });

        test("a tab dropped into another page is removed even if the drag ended first", async () => {
          const { onModelChanged } = renderWorkspaces();

          await startDrag(getTab("2"));
          await deliverMessages();
          const { id } = messages[0];

          fireDragEvent("dragend", getTab("2"));
          await deliverMessages();
          expect(messages).toContainEqual({ id, type: "end", version: 1 });
          expect(getTab("2")).toBeInTheDocument();

          postFromOtherPage({ id, type: "remove" });
          await deliverMessages();

          expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();
          expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
            isUserInteraction: true,
            reason: "transfer"
          });
        });

        test("ending a drag from another page hides the drop indicator", async () => {
          const { container } = renderWorkspaces();

          postFromOtherPage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            type: "start"
          });
          await deliverMessages();

          elementAtPoint = getOtherPanels(container);
          fireDragEvent("dragover", elementAtPoint);
          expect(
            document.querySelector("[data-drop-indicator]")
          ).not.toBeNull();
          expect(document.querySelector("[data-drag-preview]")).not.toBeNull();

          postFromOtherPage({ id: "remote", type: "end" });
          await deliverMessages();

          expect(document.querySelector("[data-drop-indicator]")).toBeNull();
          expect(document.querySelector("[data-drag-preview]")).toBeNull();
        });

        test("messages from other versions are ignored", async () => {
          const { container } = renderWorkspaces();

          otherPage.postMessage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            type: "start",
            version: 2
          });
          await deliverMessages();

          const { dragOver } = dropOnto(getOtherPanels(container));
          expect(dragOver.defaultPrevented).toBe(false);
        });

        test("a drag that isn't the one started by another page isn't mistaken for it", async () => {
          const { container, onOtherModelChanged } = renderWorkspaces();

          postFromOtherPage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            type: "start"
          });
          await deliverMessages();

          // E.g. a drag that wasn't shared, after the message that ended the remote one was missed
          elementAtPoint = getOtherPanels(container);
          const dataTransfer = createDataTransfer("other");
          const dragOver = fireDragEvent(
            "dragover",
            elementAtPoint,
            {},
            dataTransfer
          );
          const drop = fireDragEvent("drop", elementAtPoint, {}, dataTransfer);

          expect(dragOver.defaultPrevented).toBe(false);
          expect(drop.defaultPrevented).toBe(false);
          expect(onOtherModelChanged).not.toHaveBeenCalled();
        });

        test("a tab dropped into another page is removed from this one", async () => {
          const { onModelChanged } = renderWorkspaces();

          await startDrag(getTab("2"));
          await deliverMessages();
          const { id } = messages[0];

          postFromOtherPage({ id, type: "over" });
          postFromOtherPage({ id, type: "remove" });
          await deliverMessages();

          expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();
          expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
            isUserInteraction: true,
            reason: "transfer"
          });
          expect(messages).toContainEqual({ id, type: "end", version: 1 });
        });

        test("a drag released over another page isn't torn off", async () => {
          const now = vi.spyOn(Date, "now").mockReturnValue(1000);
          const onTearOff = vi.fn(() => true);
          const { container } = renderWorkspaces({ onTearOff });

          try {
            await startDrag(getTab("2"));
            await deliverMessages();

            // Left this window near its edge, then moved over the other page (which doesn't accept the drop)
            elementAtPoint = getPanels(container, "left");
            fireDragEvent("dragover", elementAtPoint, { clientX: 2 });
            now.mockReturnValue(1500);
            postFromOtherPage({ id: messages[0].id, type: "over" });
            await deliverMessages();

            now.mockReturnValue(1600);
            fireDragEvent("dragend", getTab("2"));
          } finally {
            now.mockRestore();
          }

          expect(onTearOff).not.toHaveBeenCalled();
          expect(getTab("2")).toBeInTheDocument();
        });

        test("disableDragBetweenApps keeps drags within this copy of the app", async () => {
          const { container, onOtherModelChanged } = renderWorkspaces(
            { disableDragBetweenApps: true },
            { disableDragBetweenApps: true }
          );

          await startDrag(getTab("2"));
          await deliverMessages();
          expect(messages).toEqual([]);
          fireDragEvent("dragend", getTab("2"));

          postFromOtherPage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            type: "start"
          });
          await deliverMessages();

          const { dragOver } = dropOnto(getOtherPanels(container));
          expect(dragOver.defaultPrevented).toBe(false);
          expect(onOtherModelChanged).not.toHaveBeenCalled();
        });

        test("tabs with data that can't be cloned can still be dragged within the page", async () => {
          const model = createModel();
          const left = (model.root as SplitNode<TabData>)
            .children[0] as TabsetNode<TabData>;
          left.tabs[1] = tab("2", {
            data: { label: "content 2", onClick: () => {} } as TabData
          });
          const { container } = renderWorkspaces({ defaultModel: model });

          await startDrag(getTab("2"));
          await deliverMessages();
          expect(messages).toEqual([]);

          dropOnto(getOtherPanels(container));
          expect(
            container.querySelector('[data-tabset-id="other"]')
          ).toContainElement(getTab("2"));
        });
      });

      test("touch drags still use pointer events", async () => {
        const { container, onModelChanged } = renderWorkspaces();

        await userEvent.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[TouchA>]",
            target: getTab("2")
          },
          {
            coords: { clientX: 150, clientY: 150 },
            pointerName: "TouchA",
            target: getPanels(container, "right")
          },
          { keys: "[/TouchA]", target: getPanels(container, "right") }
        ]);

        expect(getTab("2")).not.toHaveAttribute("draggable");
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "move"
        });
      });
    });

    describe("tearing off", () => {
      allowTearOffDeprecationWarning();

      test("warns (once) that the onTearOff prop is deprecated", () => {
        const warn = vi.spyOn(console, "warn");
        warn.mockClear();
        const { rerender } = renderWorkspace({ onTearOff: () => true });
        rerender(
          <Workspace<TabData>
            defaultModel={createModel()}
            onTearOff={() => false}
            renderTabContent={(tab) => <Content tab={tab} />}
          />
        );

        const calls = warn.mock.calls.filter(([message]) =>
          String(message).includes(TEAR_OFF_DEPRECATION)
        );
        expect(calls).toHaveLength(1);
      });

      // jsdom's window is 1024x768; the pointer is moved past its left edge
      const outside = {
        clientX: -10,
        clientY: 100,
        screenX: 50,
        screenY: 60
      };

      async function dragOutside(from: HTMLElement) {
        await userEvent.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[MouseLeft>]",
            target: from
          },
          { coords: outside, target: document.body },
          { keys: "[/MouseLeft]", target: document.body }
        ]);
      }

      test("dropping a tab outside of the window does nothing without onTearOff", async () => {
        const { container, onModelChanged } = renderWorkspace();

        await dragOutside(getTab("2"));

        expect(onModelChanged).not.toHaveBeenCalled();
        expect(
          container.querySelector('[data-tabset-id="left"]')
        ).toContainElement(getTab("2"));
      });

      test("a tab dropped outside of the window is passed to onTearOff, and removed if accepted", async () => {
        const onTearOff = vi.fn(() => true);
        const { container, onModelChanged } = renderWorkspace({ onTearOff });

        await dragOutside(getTab("2"));

        expect(onTearOff).toHaveBeenCalledTimes(1);
        expect(onTearOff).toHaveBeenCalledWith({
          height: 0,
          model: {
            root: {
              id: expect.any(String),
              selectedId: "2",
              tabs: [tab("2")],
              type: "tabset"
            },
            version: 1
          },
          screenX: 50,
          screenY: 60,
          tab: tab("2"),
          type: "tab",
          width: 0
        });
        expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();
        expect(container.querySelector("[data-drag-preview]")).toBeNull();
        expect(onModelChanged).toHaveBeenCalledTimes(1);
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "tear-off"
        });
      });

      test("a tab isn't removed unless onTearOff returns true", async () => {
        const onTearOff = vi.fn(() => false);
        const { container, onModelChanged } = renderWorkspace({ onTearOff });

        await dragOutside(getTab("2"));

        expect(onTearOff).toHaveBeenCalledTimes(1);
        expect(onModelChanged).not.toHaveBeenCalled();
        expect(
          container.querySelector('[data-tabset-id="left"]')
        ).toContainElement(getTab("2"));
      });

      test("a tab dragged back into the window is dropped as usual", async () => {
        const onTearOff = vi.fn(() => true);
        const { container, onModelChanged } = renderWorkspace({ onTearOff });

        await userEvent.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[MouseLeft>]",
            target: getTab("2")
          },
          { coords: outside, target: document.body },
          {
            coords: { clientX: 150, clientY: 150 },
            target: getPanels(container, "right")
          },
          { keys: "[/MouseLeft]", target: getPanels(container, "right") }
        ]);

        expect(onTearOff).not.toHaveBeenCalled();
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "move"
        });
        expect(
          container.querySelector('[data-tabset-id="right"]')
        ).toContainElement(getTab("2"));
      });

      test("the drag preview shows when releasing the pointer would tear off the tab", async () => {
        const renderDragPreview = vi.fn(
          (tab: TabNode<TabData>, { isTearOff }: { isTearOff: boolean }) =>
            isTearOff ? `Open ${tab.id} in a new window` : tab.id
        );
        const { container } = renderWorkspace({
          onTearOff: () => true,
          renderDragPreview
        });

        const user = await startDrag(container, getTab("2"));
        const getPreview = () =>
          container.querySelector<HTMLElement>("[data-drag-preview]")!;
        expect(getPreview()).toHaveTextContent(/^2$/);
        expect(getPreview()).not.toHaveAttribute("data-tear-off");

        await user.pointer({ coords: outside, target: document.body });
        expect(getPreview()).toHaveTextContent("Open 2 in a new window");
        expect(getPreview()).toHaveAttribute("data-tear-off");

        await user.keyboard("{Escape}");
      });

      test("the drag preview isn't marked without onTearOff", async () => {
        const { container } = renderWorkspace();

        const user = await startDrag(container, getTab("2"));
        await user.pointer({ coords: outside, target: document.body });
        expect(
          container.querySelector("[data-drag-preview]")
        ).not.toHaveAttribute("data-tear-off");

        await user.keyboard("{Escape}");
      });

      test("a tabset dropped outside of the window is passed to onTearOff, and removed if accepted", async () => {
        const onTearOff = vi.fn(() => true);
        const { container, onModelChanged } = renderWorkspace({
          defaultModel: {
            ...createModel(),
            root: {
              children: [
                {
                  data: { label: "left" },
                  id: "left",
                  selectedId: "2",
                  size: 30,
                  tabs: [tab("1"), tab("2")],
                  type: "tabset"
                },
                { id: "right", tabs: [tab("3")], type: "tabset" }
              ],
              id: "root",
              orientation: "horizontal",
              type: "split"
            }
          },
          onTearOff
        });

        await dragOutside(getHeader(container, "left"));

        expect(onTearOff).toHaveBeenCalledWith(
          expect.objectContaining({
            model: {
              root: {
                data: { label: "left" },
                id: "left",
                selectedId: "2",
                tabs: [tab("1"), tab("2")],
                type: "tabset"
              },
              version: 1
            },
            tabset: expect.objectContaining({ id: "left" }),
            type: "tabset"
          })
        );
        expect(container.querySelector('[data-tabset-id="left"]')).toBeNull();
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "tear-off"
        });
      });

      test("tabsets with the keepWhenEmpty flag can't be torn off", async () => {
        const onTearOff = vi.fn(() => true);
        const model = createModel();
        const root = model.root as SplitNode<TabData>;
        const { container, onModelChanged } = renderWorkspace({
          defaultModel: {
            ...model,
            root: {
              ...root,
              children: [
                {
                  ...(root.children[0] as TabsetNode<TabData>),
                  keepWhenEmpty: true
                },
                root.children[1]
              ]
            }
          },
          onTearOff
        });

        await dragOutside(getHeader(container, "left"));

        expect(onTearOff).not.toHaveBeenCalled();
        expect(onModelChanged).not.toHaveBeenCalled();

        // Its tabs can still be torn off
        await dragOutside(getTab("2"));
        expect(onTearOff).toHaveBeenCalledTimes(1);
      });

      test("tearing off the last tab of the root tabset leaves it empty", async () => {
        const { workspaceRef } = renderWorkspace({
          defaultModel: {
            root: { id: "only", tabs: [tab("1")], type: "tabset" },
            version: 1
          },
          onTearOff: () => true
        });

        await dragOutside(getTab("1"));

        expect(workspaceRef.current?.getModel().root).toEqual({
          id: "only",
          tabs: [],
          type: "tabset"
        });
      });
    });

    describe("from outside of the workspace", () => {
      describe("startExternalDrag", () => {
        // Renders a workspace beside an element that starts dragging a new tab when pressed
        function renderWithPalette({
          onClick = vi.fn(),
          preview,
          props = {},
          tabId = "new",
          toEvent = (event) => event
        }: {
          onClick?: () => void;
          toEvent?: (
            event: ReactPointerEvent<HTMLElement>
          ) => ReactPointerEvent<HTMLElement>;
          preview?: ReactNode;
          props?: Partial<WorkspaceProps<TabData>>;
          tabId?: string;
        } = {}) {
          const workspaceRef = createRef<WorkspaceImperativeHandle<TabData>>();
          const onModelChanged = vi.fn();
          const results: Promise<unknown>[] = [];

          const result = render(
            <>
              <button
                onClick={onClick}
                onPointerDown={(event) => {
                  const promise = workspaceRef.current?.startExternalDrag(
                    toEvent(event),
                    {
                      preview,
                      tab: tab(tabId, { title: "New tab" })
                    }
                  );
                  if (promise) {
                    results.push(promise);
                  }
                }}
              >
                Palette item
              </button>
              <Workspace<TabData>
                defaultModel={createModel()}
                onModelChanged={onModelChanged}
                renderTabContent={(tab) => <Content tab={tab} />}
                workspaceRef={workspaceRef}
                {...props}
              />
            </>
          );

          return {
            ...result,
            getResult: () => results[results.length - 1],
            onModelChanged,
            paletteItem: screen.getByRole("button", { name: "Palette item" }),
            workspaceRef
          };
        }

        test("dropping adds the tab where it was dropped", async () => {
          const { container, getResult, onModelChanged, paletteItem } =
            renderWithPalette();

          await drag(paletteItem, getPanels(container, "right"));

          expect(
            container.querySelector('[data-tabset-id="right"]')
          ).toContainElement(getTab("New tab"));
          expect(onModelChanged).toHaveBeenCalledTimes(1);
          expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
            isUserInteraction: true,
            reason: "add"
          });
          await expect(getResult()).resolves.toEqual({
            target: { region: "center", tabsetId: "right" }
          });
        });

        test("the tab is previewed (with renderDragPreview, or the preview option) while dragging, and the drop indicator is shown", async () => {
          const { container, paletteItem } = renderWithPalette({
            props: {
              renderDragPreview: (tab) => `Dragging ${tab.title}`
            }
          });

          const user = userEvent.setup();
          await user.pointer([
            {
              coords: { clientX: 100, clientY: 100 },
              keys: "[MouseLeft>]",
              target: paletteItem
            },
            {
              coords: { clientX: 150, clientY: 150 },
              target: getPanels(container, "right")
            }
          ]);

          expect(
            container.querySelector("[data-drag-preview]")
          ).toHaveTextContent("Dragging New tab");
          expect(
            container.querySelector("[data-drop-indicator]")
          ).not.toBeNull();

          await user.pointer({
            keys: "[/MouseLeft]",
            target: getPanels(container, "right")
          });
          expect(container.querySelector("[data-drag-preview]")).toBeNull();
          expect(container.querySelector("[data-drop-indicator]")).toBeNull();
        });

        test("the preview option replaces the default preview", async () => {
          const { container, paletteItem } = renderWithPalette({
            preview: <span>Custom preview</span>
          });

          const user = userEvent.setup();
          await user.pointer([
            {
              coords: { clientX: 100, clientY: 100 },
              keys: "[MouseLeft>]",
              target: paletteItem
            },
            {
              coords: { clientX: 150, clientY: 150 },
              target: getPanels(container, "right")
            }
          ]);

          expect(
            container.querySelector("[data-drag-preview]")
          ).toHaveTextContent("Custom preview");
        });

        test("a press without dragging (e.g. a click) does nothing", async () => {
          const onClick = vi.fn();
          const { getResult, onModelChanged, paletteItem } = renderWithPalette({
            onClick
          });

          await userEvent.click(paletteItem);

          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("the click that follows a drag is suppressed", async () => {
          const onClick = vi.fn();
          const { container, paletteItem } = renderWithPalette({ onClick });

          // The pointer is released over the element it was pressed on, so the browser would dispatch a click
          const user = userEvent.setup();
          await user.pointer([
            {
              coords: { clientX: 100, clientY: 100 },
              keys: "[MouseLeft>]",
              target: paletteItem
            },
            {
              coords: { clientX: 150, clientY: 150 },
              target: getPanels(container, "right")
            },
            { coords: { clientX: 100, clientY: 100 }, target: paletteItem },
            { keys: "[/MouseLeft]", target: paletteItem }
          ]);

          expect(onClick).not.toHaveBeenCalled();
        });

        test("Escape cancels the drag", async () => {
          const { container, getResult, onModelChanged, paletteItem } =
            renderWithPalette();

          const user = userEvent.setup();
          await user.pointer([
            {
              coords: { clientX: 100, clientY: 100 },
              keys: "[MouseLeft>]",
              target: paletteItem
            },
            {
              coords: { clientX: 150, clientY: 150 },
              target: getPanels(container, "right")
            }
          ]);
          await user.keyboard("{Escape}");
          await user.pointer({
            keys: "[/MouseLeft]",
            target: getPanels(container, "right")
          });

          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("releasing outside of the workspace does nothing", async () => {
          const { getResult, onModelChanged, paletteItem } =
            renderWithPalette();

          elementAtPoint = document.body;
          await drag(paletteItem, document.body);

          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("disableDrop is called with the new tab (and the new source)", async () => {
          const disableDrop = vi.fn(() => true);
          const { container, getResult, onModelChanged, paletteItem } =
            renderWithPalette({ props: { disableDrop } });

          await drag(paletteItem, getPanels(container, "right"));

          expect(disableDrop).toHaveBeenCalledWith({
            model: expect.anything(),
            source: "new",
            tab: expect.objectContaining({ id: "new" }),
            tabset: undefined,
            target: { region: "center", tabsetId: "right" }
          });
          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("disabled workspaces don't accept the tab", async () => {
          const { container, getResult, onModelChanged, paletteItem } =
            renderWithPalette({ props: { disabled: true } });

          await drag(paletteItem, getPanels(container, "right"));

          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("a tab can't be dropped into a workspace that already has a node with its id", async () => {
          const { container, getResult, onModelChanged, paletteItem } =
            renderWithPalette({ tabId: "3" });

          await drag(paletteItem, getPanels(container, "left"));

          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
          // The existing tab with that id isn't shown as dragged
          expect(getTab("3")).not.toHaveAttribute("data-tab-dragging");
        });

        test("pointer events are used even with a dragGroup", async () => {
          const { container, paletteItem } = renderWithPalette({
            props: { dragGroup: "group" }
          });

          await drag(paletteItem, getPanels(container, "right"));

          expect(paletteItem).not.toHaveAttribute("draggable");
          expect(
            container.querySelector('[data-tabset-id="right"]')
          ).toContainElement(getTab("New tab"));
        });

        test("a pointer that isn't pressed doesn't start a drag", async () => {
          const { paletteItem, workspaceRef } = renderWithPalette();

          // jsdom doesn't implement PointerEvent
          let result: Promise<unknown> | undefined;
          paletteItem.addEventListener("mousemove", (event) => {
            result = workspaceRef.current!.startExternalDrag(
              event as unknown as PointerEvent,
              { tab: tab("new") }
            );
          });
          fireEvent.mouseMove(paletteItem, { buttons: 0 });

          await expect(result).resolves.toBeNull();
        });

        test("a non-primary button doesn't start a drag", async () => {
          const { paletteItem, workspaceRef } = renderWithPalette();

          // jsdom doesn't implement PointerEvent
          let result: Promise<unknown> | undefined;
          paletteItem.addEventListener("mousedown", (event) => {
            result = workspaceRef.current!.startExternalDrag(
              event as unknown as PointerEvent,
              { tab: tab("new") }
            );
          });
          fireEvent.mouseDown(paletteItem, { button: 2, buttons: 2 });

          await expect(result).resolves.toBeNull();
        });

        // Presses the palette item, and (optionally) moves the pointer past the drag threshold
        async function startPaletteDrag(
          user: ReturnType<typeof userEvent.setup>,
          paletteItem: HTMLElement,
          moveTo?: HTMLElement
        ) {
          await user.pointer([
            {
              coords: { clientX: 100, clientY: 100 },
              keys: "[MouseLeft>]",
              target: paletteItem
            },
            ...(moveTo
              ? [{ coords: { clientX: 150, clientY: 150 }, target: moveTo }]
              : [])
          ]);
        }

        test("unmounting before the drag starts resolves null, and releasing the pointer later adds nothing", async () => {
          const { getResult, onModelChanged, paletteItem, unmount } =
            renderWithPalette();

          const user = userEvent.setup();
          await startPaletteDrag(user, paletteItem);
          unmount();
          await user.pointer({ keys: "[/MouseLeft]", target: document.body });

          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("unmounting mid-drag resolves null, and releasing the pointer later adds nothing", async () => {
          const { container, getResult, onModelChanged, paletteItem, unmount } =
            renderWithPalette();

          const user = userEvent.setup();
          await startPaletteDrag(
            user,
            paletteItem,
            getPanels(container, "right")
          );
          expect(container.querySelector("[data-drag-preview]")).not.toBeNull();

          unmount();
          await user.pointer({ keys: "[/MouseLeft]", target: document.body });

          expect(onModelChanged).not.toHaveBeenCalled();
          await expect(getResult()).resolves.toBeNull();
        });

        test("starting another external drag settles the pending one with null", async () => {
          const { container, getResult, paletteItem, workspaceRef } =
            renderWithPalette();

          const user = userEvent.setup();
          await startPaletteDrag(
            user,
            paletteItem,
            getPanels(container, "right")
          );
          const first = getResult();

          // jsdom doesn't implement PointerEvent
          const second = workspaceRef.current!.startExternalDrag(
            {
              button: 0,
              buttons: 1,
              clientX: 100,
              clientY: 100,
              currentTarget: paletteItem,
              pointerId: 2,
              pointerType: "mouse"
            } as unknown as PointerEvent,
            { tab: tab("other") }
          );

          await expect(first).resolves.toBeNull();

          // Releasing the first pointer doesn't affect the second drag
          await user.pointer({ keys: "[/MouseLeft]", target: document.body });
          let settled = false;
          void second.then(() => (settled = true));
          await Promise.resolve();
          expect(settled).toBe(false);
        });

        test("pressing a workspace tab settles the pending drag with null", async () => {
          const { container, getResult, onModelChanged, paletteItem } =
            renderWithPalette();

          await startPaletteDrag(
            userEvent.setup(),
            paletteItem,
            getPanels(container, "right")
          );
          const first = getResult();

          await userEvent.setup().pointer({
            coords: { clientX: 100, clientY: 100 },
            keys: "[MouseLeft>]",
            target: getTab("2")
          });

          await expect(first).resolves.toBeNull();
          expect(onModelChanged).not.toHaveBeenCalled();
        });

        test("an element in another document is rejected (with a development warning)", async () => {
          const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
          resetWarnOnceForTest();
          const { onModelChanged, workspaceRef } = renderWithPalette();

          const otherElement = document.implementation
            .createHTMLDocument("other")
            .createElement("div");
          const result = workspaceRef.current!.startExternalDrag(
            {
              buttons: 1,
              clientX: 100,
              clientY: 100,
              currentTarget: otherElement,
              pointerId: 1,
              pointerType: "mouse"
            } as unknown as PointerEvent,
            { tab: tab("new") }
          );

          await expect(result).resolves.toBeNull();
          expect(onModelChanged).not.toHaveBeenCalled();
          expect(warn).toHaveBeenCalledTimes(1);
          warn.mockRestore();
        });

        test("the event's target is used if currentTarget isn't set (e.g. the event was dispatched already)", async () => {
          const { container, getResult, paletteItem } = renderWithPalette({
            toEvent: (event) =>
              ({
                button: event.button,
                buttons: event.buttons,
                clientX: event.clientX,
                clientY: event.clientY,
                currentTarget: null,
                pointerId: event.pointerId,
                pointerType: event.pointerType,
                target: event.target
              }) as never
          });

          await drag(paletteItem, getPanels(container, "right"));

          await expect(getResult()).resolves.toEqual({
            target: { region: "center", tabsetId: "right" }
          });
        });

        test("the browser's drag of draggable elements (e.g. links) is prevented while dragging", async () => {
          const { container, paletteItem } = renderWithPalette();

          const dragStart = () => {
            const event = new Event("dragstart", {
              bubbles: true,
              cancelable: true
            });
            paletteItem.dispatchEvent(event);
            return event;
          };

          expect(dragStart().defaultPrevented).toBe(false);

          const user = userEvent.setup();
          await startPaletteDrag(
            user,
            paletteItem,
            getPanels(container, "right")
          );
          expect(dragStart().defaultPrevented).toBe(true);

          // Only the pressed element's drag is prevented
          const otherEvent = new Event("dragstart", {
            bubbles: true,
            cancelable: true
          });
          getTab("2").dispatchEvent(otherEvent);
          expect(otherEvent.defaultPrevented).toBe(false);

          await user.pointer({
            keys: "[/MouseLeft]",
            target: getPanels(container, "right")
          });
          expect(dragStart().defaultPrevented).toBe(false);
        });

        test("the promise settles even if the application throws while the tab is added", async () => {
          const { container, getResult, paletteItem } = renderWithPalette({
            props: {
              onModelChanged: () => {
                throw new Error("expected");
              }
            }
          });

          // The error is reported by the browser, as it's thrown from an event listener
          const onError = vi.fn((event: ErrorEvent) => event.preventDefault());
          window.addEventListener("error", onError);
          try {
            await drag(paletteItem, getPanels(container, "right"));
          } catch {
            // jsdom may rethrow
          } finally {
            window.removeEventListener("error", onError);
          }

          await expect(getResult()).resolves.toEqual({
            target: { region: "center", tabsetId: "right" }
          });
          expect(
            container.querySelector('[data-tabset-id="right"]')
          ).toContainElement(getTab("New tab"));
        });
      });

      describe("acceptExternalDrop", () => {
        const WIDGET_TYPE = "application/x-widget";

        function createDataTransfer({
          data = { [WIDGET_TYPE]: "chart" },
          effectAllowed = "copy"
        }: {
          data?: Record<string, string>;
          effectAllowed?: string;
        } = {}) {
          return {
            dropEffect: "none",
            effectAllowed,
            getData: (type: string) => data[type] ?? "",
            types: Object.keys(data)
          };
        }

        // jsdom doesn't implement DragEvent, so drag events are mouse events with a DataTransfer stand-in
        function fireDragEvent(
          type: string,
          target: Element,
          dataTransfer: ReturnType<typeof createDataTransfer>
        ) {
          const event = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: 150,
            clientY: 150,
            composed: true
          });
          Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
          act(() => {
            target.dispatchEvent(event);
          });

          return event;
        }

        function renderAccepting(props: Partial<WorkspaceProps<TabData>> = {}) {
          const createTab = vi.fn(
            (dataTransfer: DataTransfer): TabNode<TabData> | null => {
              const widget = dataTransfer.getData(WIDGET_TYPE);

              return widget
                ? { data: { label: widget }, id: "new", title: "New tab" }
                : null;
            }
          );

          return {
            ...renderWorkspace({
              acceptExternalDrop: { createTab, types: [WIDGET_TYPE] },
              ...props
            }),
            createTab
          };
        }

        test("drags with an accepted type show the drop indicator, and are added where they're dropped", () => {
          const { container, createTab, onModelChanged } = renderAccepting();
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer();

          const dragOver = fireDragEvent("dragover", panels, dataTransfer);
          expect(dragOver.defaultPrevented).toBe(true);
          expect(dataTransfer.dropEffect).toBe("copy");
          expect(
            container.querySelector("[data-drop-indicator]")
          ).toHaveAttribute("data-region", "center");

          const drop = fireDragEvent("drop", panels, dataTransfer);
          expect(drop.defaultPrevented).toBe(true);
          expect(createTab).toHaveBeenCalledWith(dataTransfer, {
            region: "center",
            tabsetId: "right"
          });
          expect(
            container.querySelector('[data-tabset-id="right"]')
          ).toContainElement(getTab("New tab"));
          expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
            isUserInteraction: true,
            reason: "add"
          });
          expect(container.querySelector("[data-drop-indicator]")).toBeNull();
        });

        test("types are compared case-insensitively", () => {
          const { container } = renderWorkspace({
            acceptExternalDrop: {
              createTab: () => null,
              types: ["Application/X-Widget"]
            }
          });

          const dragOver = fireDragEvent(
            "dragover",
            getPanels(container, "right"),
            createDataTransfer()
          );
          expect(dragOver.defaultPrevented).toBe(true);
        });

        test("drags without an accepted type are ignored", () => {
          const { container, createTab } = renderAccepting();
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer({
            data: { "text/plain": "hello" }
          });

          expect(
            fireDragEvent("dragover", panels, dataTransfer).defaultPrevented
          ).toBe(false);
          expect(container.querySelector("[data-drop-indicator]")).toBeNull();
          expect(
            fireDragEvent("drop", panels, dataTransfer).defaultPrevented
          ).toBe(false);
          expect(createTab).not.toHaveBeenCalled();
        });

        test("drags whose source doesn't allow any effect are ignored", () => {
          const { container } = renderAccepting();

          const dragOver = fireDragEvent(
            "dragover",
            getPanels(container, "right"),
            createDataTransfer({ effectAllowed: "none" })
          );
          expect(dragOver.defaultPrevented).toBe(false);
        });

        test("the drop effect is one the source allows", () => {
          const { container } = renderAccepting();
          const dataTransfer = createDataTransfer({ effectAllowed: "move" });

          fireDragEvent(
            "dragover",
            getPanels(container, "right"),
            dataTransfer
          );
          expect(dataTransfer.dropEffect).toBe("move");
        });

        test("nothing is added if createTab returns null", () => {
          const { container, onModelChanged } = renderAccepting();
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer({
            data: { [WIDGET_TYPE]: "" }
          });

          fireDragEvent("dragover", panels, dataTransfer);
          const drop = fireDragEvent("drop", panels, dataTransfer);

          // The drop was accepted, so the browser's default action is still prevented
          expect(drop.defaultPrevented).toBe(true);
          expect(onModelChanged).not.toHaveBeenCalled();
        });

        test("a created tab whose id is already in the model is rejected", () => {
          const createTab = vi.fn((): TabNode<TabData> | null => ({
            data: { label: "dupe" },
            id: "3",
            title: "Duplicate"
          }));
          const { container, onModelChanged } = renderAccepting({
            acceptExternalDrop: { createTab, types: [WIDGET_TYPE] }
          });
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer();

          fireDragEvent("dragover", panels, dataTransfer);
          fireDragEvent("drop", panels, dataTransfer);

          expect(createTab).toHaveBeenCalled();
          expect(screen.queryByText("Duplicate")).toBeNull();
          expect(onModelChanged).not.toHaveBeenCalled();
        });

        test("disableDrop is called with the created tab when it's dropped", () => {
          const disableDrop = vi.fn(() => true);
          const { container, onModelChanged } = renderAccepting({
            disableDrop
          });
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer();

          fireDragEvent("dragover", panels, dataTransfer);
          expect(disableDrop).not.toHaveBeenCalled();

          fireDragEvent("drop", panels, dataTransfer);
          expect(disableDrop).toHaveBeenCalledWith({
            model: expect.anything(),
            source: "new",
            tab: expect.objectContaining({ id: "new" }),
            tabset: undefined,
            target: { region: "center", tabsetId: "right" }
          });
          expect(onModelChanged).not.toHaveBeenCalled();
        });

        test("disabled workspaces (and disableDrop={true}) don't accept drags", () => {
          for (const props of [{ disabled: true }, { disableDrop: true }]) {
            const { container, createTab, unmount } = renderAccepting(props);
            const panels = getPanels(container, "right");
            const dataTransfer = createDataTransfer();

            expect(
              fireDragEvent("dragover", panels, dataTransfer).defaultPrevented
            ).toBe(false);
            fireDragEvent("drop", panels, dataTransfer);
            expect(createTab).not.toHaveBeenCalled();

            unmount();
          }
        });

        test("elements within tab content that accept the drag themselves take precedence", () => {
          const { container, createTab } = renderAccepting({
            renderTabContent: (tab) => (
              <div
                data-testid={`content-${tab.id}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => event.preventDefault()}
              />
            )
          });
          const content = screen.getByTestId("content-3");
          elementAtPoint = content;
          const dataTransfer = createDataTransfer();

          fireDragEvent("dragover", content, dataTransfer);
          expect(
            container.querySelector("[data-drop-indicator]")
          ).not.toHaveAttribute("data-region");

          fireDragEvent("drop", content, dataTransfer);
          expect(createTab).not.toHaveBeenCalled();
        });

        test("only the innermost workspace under the pointer accepts the drag", () => {
          const innerCreateTab = vi.fn((): TabNode<TabData> | null => ({
            data: { label: "inner" },
            id: "inner-new",
            title: "Inner new"
          }));
          const { container, createTab } = renderAccepting({
            renderTabContent: (node) =>
              node.id === "3" ? (
                <Workspace<TabData>
                  acceptExternalDrop={{
                    createTab: innerCreateTab,
                    types: [WIDGET_TYPE]
                  }}
                  defaultModel={{
                    root: {
                      id: "inner",
                      selectedId: "i",
                      tabs: [tab("i")],
                      type: "tabset"
                    },
                    version: 1
                  }}
                  renderTabContent={(inner) => <Content tab={inner} />}
                />
              ) : null
          });
          const innerPanels = container.querySelector<HTMLElement>(
            '[data-tabset-id="inner"] [data-tab-panels]'
          )!;
          elementAtPoint = innerPanels;
          const dataTransfer = createDataTransfer();

          fireDragEvent("dragover", innerPanels, dataTransfer);
          fireDragEvent("drop", innerPanels, dataTransfer);

          expect(innerCreateTab).toHaveBeenCalledTimes(1);
          expect(createTab).not.toHaveBeenCalled();
          expect(
            container.querySelector('[data-tabset-id="inner"]')
          ).toContainElement(getTab("Inner new"));
        });

        test("drags between workspaces aren't handled as external drags", () => {
          const { container } = renderAccepting();

          const dragOver = fireDragEvent(
            "dragover",
            getPanels(container, "right"),
            createDataTransfer({
              data: {
                "application/x-react-resizable-panels-workspace": "",
                [WIDGET_TYPE]: "chart"
              }
            })
          );
          expect(dragOver.defaultPrevented).toBe(false);
        });

        test("the drop indicator is hidden when the drag leaves (e.g. the window, or is canceled)", async () => {
          const { container } = renderAccepting();
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer();

          fireDragEvent("dragover", panels, dataTransfer);
          expect(
            container.querySelector("[data-drop-indicator]")
          ).not.toBeNull();

          vi.useFakeTimers();
          try {
            fireDragEvent("dragleave", panels, dataTransfer);
            expect(
              container.querySelector("[data-drop-indicator]")
            ).not.toBeNull();

            act(() => {
              vi.runAllTimers();
            });
            expect(container.querySelector("[data-drop-indicator]")).toBeNull();
          } finally {
            vi.useRealTimers();
          }
        });

        test("moving between elements (dragleave followed by dragover) keeps the drop indicator", async () => {
          const { container } = renderAccepting();
          const panels = getPanels(container, "right");
          const dataTransfer = createDataTransfer();

          fireDragEvent("dragover", panels, dataTransfer);

          vi.useFakeTimers();
          try {
            fireDragEvent("dragleave", panels, dataTransfer);
            fireDragEvent("dragover", panels, dataTransfer);
            act(() => {
              vi.runAllTimers();
            });
            expect(
              container.querySelector("[data-drop-indicator]")
            ).not.toBeNull();
          } finally {
            vi.useRealTimers();
          }
        });
      });
    });

    describe("tabsets", () => {
      function getTabList(container: HTMLElement, tabsetId: string) {
        const tabList = container.querySelector<HTMLElement>(
          `[data-tabset-id="${tabsetId}"] [data-tab-list]`
        )!;
        elementAtPoint = tabList;
        return tabList;
      }

      function getTabIds(container: HTMLElement, tabsetId: string) {
        return Array.from(
          container.querySelectorAll<HTMLElement>(
            `[data-tabset-id="${tabsetId}"] [data-tab]`
          )
        ).map((element) => element.dataset.tabId);
      }

      // Points at the left edge of a tabset's panels (jsdom has no layout, so every point is otherwise at the center)
      function getPanelsEdge(container: HTMLElement, tabsetId: string) {
        const panels = getPanels(container, tabsetId);
        panels.getBoundingClientRect = () =>
          ({ height: 1000, left: 0, top: 0, width: 1000 }) as DOMRect;
        return panels;
      }

      function createModelWith(
        left: Partial<TabsetNode<TabData>>
      ): WorkspaceModel<TabData> {
        const model = createModel();
        const root = model.root as SplitNode<TabData>;

        return {
          ...model,
          root: {
            ...root,
            children: [
              { ...(root.children[0] as TabsetNode<TabData>), ...left },
              root.children[1]
            ]
          }
        };
      }

      test("the empty space of a tabset's header drags the tabset", async () => {
        const { container, onModelChanged } = renderWorkspace();

        await drag(getHeader(container, "left"), getPanels(container, "right"));

        expect(container.querySelector('[data-tabset-id="left"]')).toBeNull();
        expect(getTabIds(container, "right")).toEqual(["3", "1", "2"]);
        expect(onModelChanged).toHaveBeenCalledTimes(1);
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "move"
        });
      });

      test("the empty space of a tab list drags its tabset", async () => {
        const { container } = renderWorkspace();

        await drag(
          getTabList(container, "left"),
          getPanels(container, "right")
        );

        expect(getTabIds(container, "right")).toEqual(["3", "1", "2"]);
      });

      test("dropping a tabset onto the edge of another tabset moves it there", async () => {
        const { container, workspaceRef } = renderWorkspace();

        await drag(
          getHeader(container, "right"),
          getPanelsEdge(container, "left")
        );

        expect(
          (workspaceRef.current!.getModel().root as SplitNode).children.map(
            ({ id }) => id
          )
        ).toEqual(["right", "left"]);
      });

      test("toolbar content doesn't drag the tabset", async () => {
        const { container, onModelChanged } = renderWorkspace({
          renderTabsetToolbar: (tabset) => (
            <span data-testid={`toolbar-${tabset.id}`}>toolbar</span>
          )
        });

        await drag(
          screen.getByTestId("toolbar-left"),
          getPanels(container, "right")
        );

        expect(onModelChanged).not.toHaveBeenCalled();
      });

      test("a drag handle replaces the header's empty space", async () => {
        const { container, onModelChanged } = renderWorkspace({
          renderTabsetToolbar: (tabset) => (
            <TabsetDragHandle data-testid={`handle-${tabset.id}`} />
          )
        });

        await drag(getHeader(container, "left"), getPanels(container, "right"));
        expect(onModelChanged).not.toHaveBeenCalled();

        await drag(
          screen.getByTestId("handle-left"),
          getPanels(container, "right")
        );
        expect(getTabIds(container, "right")).toEqual(["3", "1", "2"]);
      });

      test("any element with a data-tabset-drag-handle attribute is a drag handle", async () => {
        const { container } = renderWorkspace({
          renderTabsetToolbar: (tabset) => (
            <button data-tabset-drag-handle data-testid={`handle-${tabset.id}`}>
              <span data-testid={`handle-icon-${tabset.id}`} />
            </button>
          )
        });

        await drag(
          screen.getByTestId("handle-icon-left"),
          getPanels(container, "right")
        );
        expect(getTabIds(container, "right")).toEqual(["3", "1", "2"]);
      });

      test.each([
        ["the tabset has disableDrag", { disableDrag: true }, {}],
        [
          "one of its tabs has disableDrag",
          { tabs: [tab("1"), tab("2", { disableDrag: true })] },
          {}
        ],
        ["the workspace is disabled", {}, { disabled: true }]
      ])(
        "tabsets can't be dragged when %s",
        async (_, left, props: Partial<WorkspaceProps<TabData>>) => {
          const { container, onModelChanged } = renderWorkspace({
            ...props,
            defaultModel: createModelWith(left),
            renderTabsetToolbar: (tabset) => (
              <TabsetDragHandle data-testid={`handle-${tabset.id}`} />
            )
          });

          expect(screen.getByTestId("handle-left")).toHaveAttribute(
            "data-disabled"
          );

          await drag(
            screen.getByTestId("handle-left"),
            getPanels(container, "right")
          );
          expect(onModelChanged).not.toHaveBeenCalled();
        }
      );

      test("the only tabset (the root) can't be dragged", () => {
        renderWorkspace({
          defaultModel: {
            root: { id: "only", tabs: [tab("1")], type: "tabset" },
            version: 1
          },
          renderTabsetToolbar: () => <TabsetDragHandle data-testid="handle" />
        });

        expect(screen.getByTestId("handle")).toHaveAttribute("data-disabled");
      });

      test("tabsets can't be dragged while a tabset is maximized", () => {
        renderWorkspace({
          defaultModel: { ...createModel(), maximizedTabsetId: "left" },
          renderTabsetToolbar: (tabset) => (
            <TabsetDragHandle data-testid={`handle-${tabset.id}`} />
          )
        });

        for (const handle of screen.getAllByTestId("handle-left")) {
          expect(handle).toHaveAttribute("data-disabled");
        }
      });

      test("tabsets kept when empty can be moved but not merged into other tabsets", async () => {
        const { container, onModelChanged, workspaceRef } = renderWorkspace({
          defaultModel: createModelWith({ keepWhenEmpty: true })
        });

        await drag(getHeader(container, "left"), getPanels(container, "right"));
        expect(onModelChanged).not.toHaveBeenCalled();

        await drag(
          getHeader(container, "left"),
          getPanelsEdge(container, "right")
        );
        expect(
          (workspaceRef.current!.getModel().root as SplitNode).children.map(
            ({ id }) => id
          )
        ).toEqual(["left", "right"]);
        expect(onModelChanged).toHaveBeenCalledTimes(1);
      });

      test("disableDrop is called for each tab of a dragged tabset", async () => {
        const disableDrop = vi.fn(
          ({ tab }: DisableDropArgs<TabData>) => tab?.id === "2"
        );
        const { container, onModelChanged } = renderWorkspace({ disableDrop });

        await drag(getHeader(container, "left"), getPanels(container, "right"));

        const target = { region: "center", tabsetId: "right" };
        const tabset = expect.objectContaining({ id: "left" });
        expect(disableDrop).toHaveBeenCalledWith({
          model: expect.anything(),
          source: "local",
          tab: expect.objectContaining({ id: "1" }),
          tabset,
          target
        });
        expect(disableDrop).toHaveBeenCalledWith({
          model: expect.anything(),
          source: "local",
          tab: expect.objectContaining({ id: "2" }),
          tabset,
          target
        });
        expect(onModelChanged).not.toHaveBeenCalled();
      });

      test("disableDrop is called for each tab's position when a tabset's tabs are dropped into a tab list", async () => {
        const disableDrop = vi.fn((_: DisableDropArgs<TabData>) => false);
        const { container } = renderWorkspace({ disableDrop });

        await drag(
          getHeader(container, "left"),
          getTabList(container, "right")
        );

        expect(
          disableDrop.mock.calls.map(([{ tab, target }]) => [tab?.id, target])
        ).toEqual([
          ["1", { index: 1, tabsetId: "right" }],
          ["2", { index: 2, tabsetId: "right" }]
        ]);
      });

      test("disableDrop is called without a tab for a tabset without tabs", async () => {
        const disableDrop = vi.fn(() => true);
        const { container, onModelChanged } = renderWorkspace({
          defaultModel: createModelWith({ keepWhenEmpty: true, tabs: [] }),
          disableDrop
        });

        await drag(
          getHeader(container, "left"),
          getPanelsEdge(container, "right")
        );

        expect(disableDrop).toHaveBeenCalledWith({
          model: expect.anything(),
          source: "local",
          tab: undefined,
          tabset: expect.objectContaining({ id: "left" }),
          target: { region: "left", tabsetId: "right" }
        });
        expect(onModelChanged).not.toHaveBeenCalled();
      });

      test("a dragged tabset is marked, and its preview shows its selected tab and the number of other tabs by default", async () => {
        const { container } = renderWorkspace();

        await startDrag(container, getHeader(container, "left"));

        expect(
          container.querySelector('[data-tabset-id="left"]')
        ).toHaveAttribute("data-tabset-dragging");
        const preview = container.querySelector("[data-drag-preview]");
        expect(preview).toHaveAttribute("data-drag-type", "tabset");
        expect(preview?.textContent).toBe("One (+1)");
      });

      test("the default preview of a dragged tabset with one tab has no count", async () => {
        const { container } = renderWorkspace();

        await startDrag(container, getHeader(container, "right"));

        expect(
          container.querySelector("[data-drag-preview]")?.textContent
        ).toBe("3");
      });

      test("renderDragPreview customizes the preview of a dragged tabset's selected tab, without a count", async () => {
        const { container } = renderWorkspace({
          renderDragPreview: (tab) => `Custom ${tab.title}`
        });

        await startDrag(container, getHeader(container, "left"));

        expect(
          container.querySelector("[data-drag-preview]")?.textContent
        ).toBe("Custom One");
      });

      test("renderTabsetDragPreview customizes the preview", async () => {
        const { container } = renderWorkspace({
          renderTabsetDragPreview: (tabset) => `${tabset.tabs.length} tabs`
        });

        await startDrag(container, getHeader(container, "left"));

        expect(
          container.querySelector("[data-drag-preview]")
        ).toHaveTextContent("2 tabs");
      });

      test("moveTabset moves tabsets imperatively", () => {
        const { onModelChanged, workspaceRef } = renderWorkspace();

        act(() => {
          workspaceRef.current!.moveTabset("left", {
            region: "center",
            tabsetId: "right"
          });
        });

        expect(workspaceRef.current!.getModel().root).toMatchObject({
          id: "right",
          tabs: [{ id: "3" }, { id: "1" }, { id: "2" }]
        });
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: false,
          reason: "move"
        });
      });

      test("moveTab and moveTabset treat left and right as sides of the screen in a right-to-left layout", () => {
        const getTabIds = (workspaceRef: {
          current: WorkspaceImperativeHandle<TabData> | null;
        }) =>
          (
            workspaceRef.current!.getModel().root as SplitNode<TabData>
          ).children.map((child) =>
            (child as TabsetNode<TabData>).tabs.map((tab) => tab.id)
          );

        // Left-to-right: the left region is before the target
        const ltr = renderWorkspace();
        act(() => {
          ltr.workspaceRef.current!.moveTab("1", {
            region: "left",
            tabsetId: "right"
          });
        });
        expect(getTabIds(ltr.workspaceRef)).toEqual([["2"], ["1"], ["3"]]);

        const rtl = renderWorkspace({ style: { direction: "rtl" } });
        act(() => {
          rtl.workspaceRef.current!.moveTab("1", {
            region: "left",
            tabsetId: "right"
          });
        });
        expect(getTabIds(rtl.workspaceRef)).toEqual([["2"], ["3"], ["1"]]);

        const rtlTabset = renderWorkspace({ style: { direction: "rtl" } });
        act(() => {
          rtlTabset.workspaceRef.current!.moveTabset("left", {
            region: "left",
            tabsetId: "right"
          });
        });
        expect(getTabIds(rtlTabset.workspaceRef)).toEqual([["3"], ["1", "2"]]);
      });
    });
  });
});
