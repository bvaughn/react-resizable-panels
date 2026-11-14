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
  BeforeModelChangeArgs,
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
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
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

    test("classNames and styles can be functions of their tabset or tab", () => {
      const { container } = renderWorkspace({
        classNames: {
          header: (tabset) => `header-${tabset.id}`,
          tab: (tab, { isSelected }) =>
            isSelected ? `selected-${tab.id}` : `tab-${tab.data.label}`,
          tabContent: (tab, { tabsetId }) => `content-${tabsetId}-${tab.id}`,
          tabList: (tabset) => `tab-list-${tabset.id}`,
          tabPanels: (tabset) => `tab-panels-${tabset.id}`,
          tabset: (tabset, { isRoot }) =>
            `tabset-${tabset.id}-${isRoot ? "root" : "child"}`,
          toolbar: (tabset, { selectedTabId }) =>
            `toolbar-${tabset.id}-${selectedTabId}`
        },
        renderTabsetToolbar: () => null,
        styles: {
          tab: (tab) => (tab.id === "2" ? { color: "red" } : undefined),
          tabList: (tabset) =>
            tabset.id === "right" ? { color: "blue" } : undefined,
          tabset: (tabset) =>
            tabset.id === "left" ? { color: "green" } : undefined
        }
      });

      const left = container.querySelector('[data-tabset-id="left"]')!;
      expect(left).toHaveClass("tabset-left-child");
      expect(left).toHaveStyle({ color: "rgb(0, 128, 0)" });
      expect(left.querySelector("[data-tabset-header]")).toHaveClass(
        "header-left"
      );
      expect(left.querySelector("[data-tab-list]")).toHaveClass(
        "tab-list-left"
      );
      expect(left.querySelector("[data-tabset-toolbar]")).toHaveClass(
        "toolbar-left-1"
      );
      expect(left.querySelector("[data-tab-panels]")).toHaveClass(
        "tab-panels-left"
      );
      expect(
        container.querySelector('[data-tabset-id="right"] [data-tab-list]')
      ).toHaveStyle({ color: "rgb(0, 0, 255)" });

      expect(getTab("One")).toHaveClass("selected-1");
      expect(getTab("2")).toHaveClass("tab-content 2");
      expect(getTab("2")).toHaveStyle({ color: "rgb(255, 0, 0)" });
      // Tabs handle touch drags themselves, whatever their styles
      expect(getTab("2").style.touchAction).toBe("none");

      expect(
        screen
          .getByTestId("content-2")
          .closest<HTMLElement>("[data-tab-content]")
      ).toHaveClass("content-left-2");

      // Functions are called again when the state they're given changes
      fireEvent.click(getTab("2"));
      expect(getTab("2")).toHaveClass("selected-2");
      expect(left.querySelector("[data-tabset-toolbar]")).toHaveClass(
        "toolbar-left-2"
      );
    });

    test("classNames and styles functions receive tabset data", () => {
      const { container } = renderWorkspace({
        classNames: {
          tabset: (tabset) =>
            (tabset.data as { compact?: boolean } | undefined)?.compact
              ? "compact"
              : undefined
        },
        defaultModel: {
          root: {
            children: [
              {
                data: { compact: true },
                id: "left",
                tabs: [tab("1")],
                type: "tabset"
              },
              { id: "right", tabs: [tab("2")], type: "tabset" }
            ],
            id: "root",
            orientation: "horizontal",
            type: "split"
          },
          version: 1
        }
      });

      expect(container.querySelector('[data-tabset-id="left"]')).toHaveClass(
        "compact"
      );
      expect(
        container.querySelector('[data-tabset-id="right"]')
      ).not.toHaveClass("compact");
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

    test("classNames and styles for splits can be functions of the split", () => {
      const { container } = renderWorkspace({
        classNames: { split: (split) => `split-${split.orientation}` },
        styles: {
          split: (split) => ({ columnGap: `${split.children.length}px` })
        }
      });

      const split = container.querySelector<HTMLElement>("[data-split]")!;
      expect(split).toHaveClass("split-horizontal");
      expect(split.style.columnGap).toBe("2px");
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

    test.each([
      ["input", <input data-testid="control" />],
      ["select", <select data-testid="control" />],
      ["textarea", <textarea data-testid="control" />],
      ["editable content", <span contentEditable data-testid="control" />],
      ["checkbox role", <div role="checkbox" data-testid="control" />],
      ["switch role", <div role="switch" data-testid="control" />],
      ["textbox role", <div role="textbox" data-testid="control" />],
      [
        "label of a control",
        <label data-testid="control">
          <input type="checkbox" /> Pin
        </label>
      ]
    ])("%s descendants don't select the tab", (_, control) => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            {tab.id}
            {tab.id === "2" && control}
          </div>
        )
      });

      fireEvent.click(screen.getByTestId("control"));
      expect(getTab("2")).toHaveAttribute("aria-selected", "false");
    });

    test("labels without a control select the tab", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            <label data-testid={`label-${tab.id}`}>{tab.id}</label>
          </div>
        )
      });

      fireEvent.click(screen.getByTestId("label-2"));
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
    });

    test("content that isn't editable selects the tab", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            {tab.id}
            <span contentEditable={false} data-testid={`static-${tab.id}`} />
          </div>
        )
      });

      fireEvent.click(screen.getByTestId("static-2"));
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
    });

    test("pressing an input within a tab doesn't start dragging it", async () => {
      // jsdom has no layout, so every edge between tabsets is at (0, 0), and pressing there would start resizing instead
      const coords = { clientX: 100, clientY: 100 };

      renderWorkspace({
        // Mouse drags between workspaces in a group use HTML drag and drop, which makes the pressed tab draggable
        dragGroup: "group",
        renderTab: (tab, props) => (
          <div {...props}>
            {tab.id}
            <input data-testid={`input-${tab.id}`} />
          </div>
        )
      });

      const input = screen.getByTestId("input-2");
      await userEvent.pointer({ coords, keys: "[MouseLeft>]", target: input });
      expect(getTab("2").draggable).toBe(false);
      await userEvent.pointer({ coords, keys: "[/MouseLeft]", target: input });

      // Pressing the tab itself does
      await userEvent.pointer({
        coords,
        keys: "[MouseLeft>]",
        target: getTab("2")
      });
      expect(getTab("2").draggable).toBe(true);
      await userEvent.pointer({
        coords,
        keys: "[/MouseLeft]",
        target: getTab("2")
      });
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

    test("keys within descendants are ignored", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            <input data-testid={`input-${tab.id}`} />
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
    test("resizeSplit sets the sizes of a split's children", () => {
      const { onModelChanged, workspaceRef } = renderWorkspace();

      act(() => {
        workspaceRef.current!.resizeSplit("root", { left: "250px" });
      });

      expect(
        (
          workspaceRef.current!.getModel().root as SplitNode<TabData>
        ).children.map(({ size }) => size)
      ).toEqual(["250px", undefined]);
      expect(onModelChanged).toHaveBeenCalledTimes(1);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "resize"
      });

      // Sizes that don't change the model aren't reported
      act(() => {
        workspaceRef.current!.resizeSplit("root", { left: "250px" });
      });
      expect(onModelChanged).toHaveBeenCalledTimes(1);
    });

    test("resizeSplit converts sizes with units to percentages of the space the split's children share (not its separators)", () => {
      const { container, workspaceRef } = renderWorkspace();
      const group = container.querySelector<HTMLElement>(
        '[data-split-id="root"]'
      )!;
      group.getBoundingClientRect = () => new DOMRect(0, 0, 1010, 500);
      group
        .querySelectorAll<HTMLElement>("[data-panel]")
        .forEach((panel, index) => {
          const width = index === 0 ? 400 : 600;
          panel.getBoundingClientRect = () => new DOMRect(0, 0, width, 500);
          Object.defineProperty(panel, "offsetWidth", { value: width });
        });

      act(() => {
        workspaceRef.current!.resizeSplit("root", { left: "250px" });
      });

      const children = (
        workspaceRef.current!.getModel().root as SplitNode<TabData>
      ).children;
      expect(children.map(({ size }) => size)).toEqual([25, undefined]);
    });

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

    test("addTab adds a tab at a drop target in one change", () => {
      const { container, onModelChanged, workspaceRef } = renderWorkspace();
      onModelChanged.mockClear();

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          target: { region: "bottom", tabsetId: "right" }
        });
      });
      expect(onModelChanged).toHaveBeenCalledTimes(1);
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "add"
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      expect(root.children[1]).toMatchObject({
        children: [
          { id: "right" },
          { selectedId: "4", tabs: [{ id: "4" }], type: "tabset" }
        ],
        orientation: "vertical"
      });
      expect(
        container.querySelector('[data-tabset-id="right"]')
      ).not.toContainElement(getTab("4"));
    });

    test("addTab converts sizes with other units to percentages of the split", () => {
      const { container, workspaceRef } = renderWorkspace();
      container.querySelector<HTMLElement>(
        "[data-workspace-layout]"
      )!.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 500);

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          size: "100px",
          target: { edge: "bottom" }
        });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      expect(root.orientation).toBe("vertical");
      expect(root.children[1]).toMatchObject({ size: 20, tabs: [{ id: "4" }] });
      expect(root.children[0].size).toBe(80);
    });

    test("addTab converts sizes against the parent split when it has the same orientation", () => {
      const { container, workspaceRef } = renderWorkspace();
      container.querySelector<HTMLElement>(
        '[data-split-id="root"]'
      )!.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 500);

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          size: "100px",
          target: { region: "right", tabsetId: "left" }
        });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      expect(root.children).toHaveLength(3);
      expect(root.children[1]).toMatchObject({ size: 10, tabs: [{ id: "4" }] });
    });

    test("addTab converts sizes against the tabset when the parent split has a different orientation", () => {
      const { container, workspaceRef } = renderWorkspace();
      container.querySelector<HTMLElement>(
        '[data-tabset-id="left"]'
      )!.getBoundingClientRect = () => new DOMRect(0, 0, 500, 400);

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          size: "100px",
          target: { region: "bottom", tabsetId: "left" }
        });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      const wrapper = root.children[0] as SplitNode<TabData>;
      expect(wrapper.orientation).toBe("vertical");
      expect(wrapper.children[1]).toMatchObject({
        size: 25,
        tabs: [{ id: "4" }]
      });
    });

    test("addTab converts sizes against the layout's elements when the destination is maximized", () => {
      const { container, workspaceRef } = renderWorkspace();
      act(() => {
        workspaceRef.current!.maximizeTabset("left");
      });

      const layout = container.querySelector<HTMLElement>(
        "[data-workspace-layout]"
      )!;
      layout.querySelector<HTMLElement>(
        '[data-split-id="root"]'
      )!.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 500);
      // The panels share 990px (the Group's own 1000px includes a separator); the left panel is 500px
      layout
        .querySelectorAll<HTMLElement>('[data-split-id="root"] > [data-panel]')
        .forEach((panel, index) => {
          const width = index === 0 ? 500 : 490;
          panel.getBoundingClientRect = () => new DOMRect(0, 0, width, 400);
          Object.defineProperty(panel, "offsetWidth", { value: width });
        });

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          size: "100px",
          target: { region: "right", tabsetId: "left" }
        });
      });
      let root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      // Not 20 (relative to the destination's panel) or 10 (relative to the Group's element)
      expect(root.children[1]).toMatchObject({ tabs: [{ id: "4" }] });
      expect(root.children[1].size).toBeCloseTo((100 / 990) * 100, 2);

      // Adding a tab restores the maximized tabset
      act(() => {
        workspaceRef.current!.maximizeTabset("left");
      });
      layout.querySelector<HTMLElement>("[data-panel]")!.getBoundingClientRect =
        () => new DOMRect(0, 0, 500, 400);
      act(() => {
        workspaceRef.current!.addTab(tab("5"), {
          size: "100px",
          target: { region: "top", tabsetId: "left" }
        });
      });
      root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      const wrapper = root.children[0] as SplitNode<TabData>;
      expect(wrapper.orientation).toBe("vertical");
      expect(wrapper.children[0]).toMatchObject({
        size: 25,
        tabs: [{ id: "5" }]
      });
    });

    test("addTab measures the maximized destination's split, not a nested workspace's split with the same id", () => {
      const nestedModel: WorkspaceModel<TabData> = {
        root: {
          children: [
            { id: "n1", tabs: [tab("7")], type: "tabset" },
            { id: "n2", tabs: [tab("8")], type: "tabset" }
          ],
          id: "inner",
          orientation: "vertical",
          type: "split"
        },
        version: 1
      };
      const model: WorkspaceModel<TabData> = {
        root: {
          children: [
            { id: "a", tabs: [tab("1")], type: "tabset" },
            {
              children: [
                { id: "dest", tabs: [tab("2")], type: "tabset" },
                { id: "other", tabs: [tab("3")], type: "tabset" }
              ],
              id: "inner",
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
      const { container, workspaceRef } = renderWorkspace({
        defaultModel: model,
        renderTabContent: (tab) =>
          tab.id === "1" ? (
            <Workspace<TabData>
              defaultModel={nestedModel}
              renderTabContent={(tab) => <Content tab={tab} />}
            />
          ) : (
            <Content tab={tab} />
          )
      });
      act(() => {
        workspaceRef.current!.maximizeTabset("dest");
      });

      const groups = container.querySelectorAll<HTMLElement>(
        '[data-workspace-layout] [data-split-id="inner"]'
      );
      expect(groups).toHaveLength(2);
      // The nested workspace's split comes first in the document
      groups[0].getBoundingClientRect = () => new DOMRect(0, 0, 200, 200);
      groups[1].getBoundingClientRect = () => new DOMRect(0, 0, 1000, 500);
      // The outer split's panels share 490px (less than its element's 500px)
      groups[1]
        .querySelectorAll<HTMLElement>(":scope > [data-panel]")
        .forEach((panel, index) => {
          const height = index === 0 ? 240 : 250;
          panel.getBoundingClientRect = () => new DOMRect(0, 0, 1000, height);
          Object.defineProperty(panel, "offsetHeight", { value: height });
        });

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          size: "100px",
          target: { region: "bottom", tabsetId: "dest" }
        });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      const inner = root.children[1] as SplitNode<TabData>;
      expect(inner.children[1]).toMatchObject({ tabs: [{ id: "4" }] });
      expect(inner.children[1].size).toBeCloseTo((100 / 490) * 100, 2);
    });

    test("addTab adds to a floating tabset rather than converting sizes", () => {
      const model = createModel();
      model.floating = [
        {
          height: 200,
          id: "float",
          selectedId: "5",
          tabs: [tab("5")],
          type: "tabset",
          width: 300,
          x: 0,
          y: 0
        }
      ];
      const { workspaceRef } = renderWorkspace({ defaultModel: model });

      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          size: "100px",
          target: { region: "right", tabsetId: "float" }
        });
      });

      expect(
        workspaceRef.current!.getModel().floating?.[0].tabs.map(({ id }) => id)
      ).toEqual(["5", "4"]);
    });

    test("ParentTabset addTab adds to its tabset in the center region, at an index", () => {
      let parentTabset: ParentTabset<TabData> | null = null;
      function Capture() {
        parentTabset = useParentTabset<TabData>();
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "3" ? <Capture /> : null)
      });

      act(() => {
        parentTabset!.addTab(tab("4"), { index: 0, region: "center" });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      expect(root.children).toHaveLength(2);
      expect(
        (root.children[1] as TabsetNode<TabData>).tabs.map(({ id }) => id)
      ).toEqual(["4", "3"]);
    });

    test("addTab mirrors left and right targets in a right-to-left layout", () => {
      const { workspaceRef } = renderWorkspace({
        style: { direction: "rtl" }
      });

      act(() => {
        workspaceRef.current!.addTab(tab("4"), { target: { edge: "left" } });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      expect(root.children.at(-1)).toMatchObject({ tabs: [{ id: "4" }] });
    });

    test("ParentTabset addTab adds a tab beside its tabset", () => {
      let parentTabset: ParentTabset<TabData> | null = null;
      function Capture() {
        parentTabset = useParentTabset<TabData>();
        return null;
      }

      const { workspaceRef } = renderWorkspace({
        renderTabContent: (tab) => (tab.id === "3" ? <Capture /> : null)
      });

      act(() => {
        parentTabset!.addTab(tab("4"), { region: "right", size: 10 });
      });

      const root = workspaceRef.current!.getModel().root as SplitNode<TabData>;
      expect(root.children).toHaveLength(3);
      expect(root.children[2]).toMatchObject({ size: 10, tabs: [{ id: "4" }] });
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

  describe("onBeforeModelChange", () => {
    test("is called before changes the user makes, which it can block", () => {
      const onBeforeModelChange = vi.fn(
        (args: BeforeModelChangeArgs<TabData>) => args.reason !== "close"
      );
      const { onModelChanged, workspaceRef } = renderWorkspace({
        onBeforeModelChange
      });
      const prevModel = workspaceRef.current!.getModel();

      // Closing with a close button
      fireEvent.click(screen.getByRole("button", { name: "Close 2" }));
      expect(onBeforeModelChange).toHaveBeenCalledTimes(1);
      expect(onBeforeModelChange).toHaveBeenLastCalledWith({
        model: expect.objectContaining({
          root: expect.objectContaining({
            children: [
              expect.objectContaining({ tabs: [tab("1", { title: "One" })] }),
              expect.anything()
            ]
          })
        }),
        prevModel,
        reason: "close",
        removedTabs: [tab("2")]
      });

      // Closing with the Delete key
      fireEvent.keyDown(getTab("One"), { key: "Delete" });
      expect(onBeforeModelChange).toHaveBeenCalledTimes(2);
      expect(onBeforeModelChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          reason: "close",
          removedTabs: [tab("1", { title: "One" })]
        })
      );

      expect(getTab("One")).toBeInTheDocument();
      expect(getTab("2")).toBeInTheDocument();
      expect(workspaceRef.current!.getModel()).toBe(prevModel);
      expect(onModelChanged).not.toHaveBeenCalled();

      // Other changes are allowed
      fireEvent.click(getTab("2"));
      expect(onBeforeModelChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ reason: "select", removedTabs: [] })
      );
      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "select"
      });
    });

    test("allows changes unless it returns false", () => {
      const { onModelChanged } = renderWorkspace({
        onBeforeModelChange: () => {}
      });

      fireEvent.click(screen.getByRole("button", { name: "Close 2" }));
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "close"
      });
    });

    test("isn't called for changes made with the imperative API", () => {
      const onBeforeModelChange = vi.fn(() => false);
      const { onModelChanged, workspaceRef } = renderWorkspace({
        onBeforeModelChange
      });

      act(() => {
        workspaceRef.current!.closeTab("2");
      });

      expect(onBeforeModelChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: false,
        reason: "close"
      });
    });

    test("a blocked close with the Delete key doesn't leave a focus request that is applied later", () => {
      const { workspaceRef } = renderWorkspace({
        onBeforeModelChange: ({ reason }) => reason !== "close"
      });
      const first = getTab("One");
      first.focus();

      fireEvent.keyDown(first, { key: "Delete" });
      expect(getTab("One")).toBeInTheDocument();
      expect(getTab("2")).toBeInTheDocument();

      // An unrelated render of the tab that would have received focus
      act(() => {
        workspaceRef.current!.updateTab("2", { title: "Two" });
      });
      expect(getTab("Two")).not.toHaveFocus();
    });

    test("a change made by the callback (e.g. with the imperative API) replaces the change it was called for", () => {
      const { workspaceRef } = renderWorkspace({
        onBeforeModelChange: ({ reason }) => {
          if (reason === "close") {
            workspaceRef.current!.selectTab("2");
          }
          return true;
        }
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Close 2" }));
      });

      expect(getTab("2")).toHaveAttribute("aria-selected", "true");
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
    function createCollapseReporter() {
      const result = {
        Reporter() {
          result.reportCollapseToFit =
            useWorkspaceContext("Reporter").reportCollapseToFit;
          return null;
        },
        reportCollapseToFit: (() => {}) as (changes: {
          [tabsetId: string]: boolean | undefined;
        }) => void
      };
      return {
        Reporter: result.Reporter,
        reportCollapseToFit: (changes: {
          [tabsetId: string]: boolean | undefined;
        }) => result.reportCollapseToFit(changes)
      };
    }

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

    test("lazyTabContent", () => {
      const log: string[] = [];
      const { workspaceRef } = renderWorkspace({
        lazyTabContent: true,
        renderTabContent: (tab) => <EffectLogger id={tab.id} log={log} />
      });

      // Tabs that are visible in the initial model are mounted right away
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();
      expect(screen.queryByTestId("content-2")).toBeNull();

      // Others are mounted when they're first selected, and then stay mounted
      fireEvent.click(getTab("2"));
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
      expect(screen.getByTestId("content-1")).toBeInTheDocument();

      fireEvent.click(getTab("One"));
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
      expect(log).not.toContain("unmount 2");

      // Moving a tab that has been shown doesn't unmount it, even if it isn't selected where it's moved to
      act(() => {
        workspaceRef.current!.moveTab("2", { index: 0, tabsetId: "right" });
      });
      act(() => {
        workspaceRef.current!.selectTab("3");
      });
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
      expect(log).not.toContain("unmount 2");

      // Tabs added without being selected aren't mounted until they are
      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          select: false,
          tabsetId: "right"
        });
      });
      expect(screen.queryByTestId("content-4")).toBeNull();
      act(() => {
        workspaceRef.current!.selectTab("4");
      });
      expect(screen.getByTestId("content-4")).toBeInTheDocument();
    });

    test("lazyTabContent doesn't mount the selected tabs of collapsed tabsets until they're expanded", () => {
      const model = createModel();
      const root = model.root as SplitNode<TabData>;
      const { workspaceRef } = renderWorkspace({
        defaultModel: {
          ...model,
          root: {
            ...root,
            children: [
              {
                ...(root.children[0] as TabsetNode<TabData>),
                collapsed: true,
                collapsible: true
              },
              root.children[1]
            ]
          }
        },
        lazyTabContent: true
      });

      expect(screen.queryByTestId("content-1")).toBeNull();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();

      act(() => workspaceRef.current!.expandTabset("left"));
      expect(screen.getByTestId("content-1")).toBeInTheDocument();

      // It stays mounted when the tabset is collapsed again
      act(() => workspaceRef.current!.collapseTabset("left"));
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
    });

    test("lazyTabContent doesn't mount the selected tabs of tabsets covered by a maximized tabset until they're shown", () => {
      const { workspaceRef } = renderWorkspace({
        defaultModel: { ...createModel(), maximizedTabsetId: "right" },
        lazyTabContent: true
      });

      expect(screen.queryByTestId("content-1")).toBeNull();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();

      act(() => workspaceRef.current!.restoreTabset());
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();
    });

    test("lazyTabContent mounts the selected tab of a floating tabset while another tabset is maximized", () => {
      const states: Record<string, ParentTabState | null> = {};
      function TabState() {
        const tab = useParentTab();
        states[tab!.id] = useParentTabState();
        return null;
      }

      const model = createModel();
      model.maximizedTabsetId = "right";
      model.floating = [
        {
          height: 200,
          id: "float",
          selectedId: "5",
          tabs: [tab("5")],
          type: "tabset",
          width: 300,
          x: 0,
          y: 0
        }
      ];
      renderWorkspace({
        defaultModel: model,
        lazyTabContent: true,
        renderTabContent: (tab) => (
          <>
            <TabState />
            <EffectLogger id={tab.id} log={[]} />
          </>
        )
      });

      expect(screen.getByTestId("content-5")).toBeInTheDocument();
      expect(states["5"]).toMatchObject({ isVisible: true });
      expect(screen.getByTestId("content-3")).toBeInTheDocument();
      expect(screen.queryByTestId("content-1")).toBeNull();
    });

    test("lazyTabContent follows the collapsed state shown (e.g. collapsed to fit), not just the model's", () => {
      const { Reporter, reportCollapseToFit } = createCollapseReporter();

      const { workspaceRef } = renderWorkspace({
        lazyTabContent: true,
        renderTabContent: (tab) => (
          <>
            {tab.id === "3" && <Reporter />}
            <EffectLogger id={tab.id} log={[]} />
          </>
        )
      });

      // The model has "left" expanded, but it's shown collapsed
      act(() => reportCollapseToFit({ left: true }));
      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          select: true,
          tabsetId: "left"
        });
      });
      expect(screen.queryByTestId("content-4")).toBeNull();

      act(() => reportCollapseToFit({ left: undefined }));
      expect(screen.getByTestId("content-4")).toBeInTheDocument();
    });

    test("lazyTabContent for some tabs", () => {
      const lazyTabContent = vi.fn((tab: TabNode<TabData>) => tab.id === "2");
      const model = createModel();
      const root = model.root as SplitNode<TabData>;
      const left = root.children[0] as TabsetNode<TabData>;
      renderWorkspace({
        defaultModel: {
          ...model,
          root: {
            ...root,
            children: [
              { ...left, tabs: [...left.tabs, tab("4")] },
              root.children[1]
            ]
          }
        },
        lazyTabContent
      });

      // Hidden tabs that aren't lazy are mounted right away
      expect(screen.getByTestId("content-4")).toBeInTheDocument();

      expect(lazyTabContent).toHaveBeenCalledWith(
        expect.objectContaining({ id: "2" })
      );
      expect(screen.queryByTestId("content-2")).toBeNull();
      fireEvent.click(getTab("2"));
      fireEvent.click(getTab("One"));
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
    });

    test("lazyTabContent with activity: content isn't rendered until it's first shown, then its effects are unmounted while it's hidden", () => {
      const log: string[] = [];
      renderWorkspace({
        hiddenTabBehavior: "activity",
        lazyTabContent: true,
        renderTabContent: (tab) => <EffectLogger id={tab.id} log={log} />
      });

      expect(screen.queryByTestId("content-2")).toBeNull();

      fireEvent.click(getTab("2"));
      expect(log).toContain("mount 2");

      fireEvent.click(getTab("One"));
      expect(log).toContain("unmount 2");
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
    });

    test("lazyTabContent with unmount: content is only mounted while it's visible", () => {
      renderWorkspace({
        hiddenTabBehavior: "unmount",
        lazyTabContent: true
      });

      expect(screen.queryByTestId("content-2")).toBeNull();
      fireEvent.click(getTab("2"));
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
      fireEvent.click(getTab("One"));
      expect(screen.queryByTestId("content-2")).toBeNull();
    });

    test("unmount and activity hide the content of selected tabs in collapsed tabsets too", () => {
      const model = createModel();
      const root = model.root as SplitNode<TabData>;
      const collapsibleModel = {
        ...model,
        root: {
          ...root,
          children: [
            {
              ...(root.children[0] as TabsetNode<TabData>),
              collapsible: true
            },
            root.children[1]
          ]
        }
      };

      // unmount
      const { unmount, workspaceRef } = renderWorkspace({
        defaultModel: collapsibleModel,
        hiddenTabBehavior: "unmount"
      });
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
      act(() => workspaceRef.current!.collapseTabset("left"));
      expect(screen.queryByTestId("content-1")).toBeNull();
      act(() => workspaceRef.current!.expandTabset("left"));
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
      unmount();

      // activity
      const log: string[] = [];
      const { workspaceRef: activityRef } = renderWorkspace({
        defaultModel: collapsibleModel,
        hiddenTabBehavior: "activity",
        renderTabContent: (tab) => <EffectLogger id={tab.id} log={log} />
      });
      expect(log).toContain("mount 1");
      act(() => activityRef.current!.collapseTabset("left"));
      expect(log).toContain("unmount 1");
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
    });

    test("content that is already mounted stays mounted if its tab becomes lazy", () => {
      let isLazy = false;
      const { rerender } = renderWorkspace({ lazyTabContent: () => isLazy });
      expect(screen.getByTestId("content-2")).toBeInTheDocument();

      isLazy = true;
      rerender(
        <Workspace<TabData>
          defaultModel={createModel()}
          lazyTabContent={() => isLazy}
          renderTabContent={(tab) => <Content tab={tab} />}
        />
      );
      expect(screen.getByTestId("content-2")).toBeInTheDocument();
    });

    test("unmount keeps content mounted while a tabset is only shown collapsed (e.g. collapsed to fit)", () => {
      const { Reporter, reportCollapseToFit } = createCollapseReporter();

      renderWorkspace({
        hiddenTabBehavior: "unmount",
        renderTabContent: (tab) => (
          <>
            {tab.id === "3" && <Reporter />}
            <Content tab={tab} />
          </>
        )
      });

      act(() => reportCollapseToFit({ left: true }));
      expect(screen.getByTestId("content-1")).toBeInTheDocument();

      act(() => reportCollapseToFit({ left: undefined }));
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
    });

    test("lazyTabContent with unmount doesn't mount content in a tabset that is only shown collapsed until it's expanded", () => {
      const { Reporter, reportCollapseToFit } = createCollapseReporter();
      const { workspaceRef } = renderWorkspace({
        hiddenTabBehavior: "unmount",
        lazyTabContent: true,
        renderTabContent: (tab) => (
          <>
            {tab.id === "3" && <Reporter />}
            <Content tab={tab} />
          </>
        )
      });

      act(() => reportCollapseToFit({ left: true }));
      act(() => {
        workspaceRef.current!.addTab(tab("4"), {
          select: true,
          tabsetId: "left"
        });
      });
      expect(screen.queryByTestId("content-4")).toBeNull();

      act(() => reportCollapseToFit({ left: undefined }));
      expect(screen.getByTestId("content-4")).toBeInTheDocument();
    });

    test("unmount and activity hide the content of tabsets covered by a maximized tabset, until restored", () => {
      // unmount
      const { unmount, workspaceRef } = renderWorkspace({
        hiddenTabBehavior: "unmount"
      });
      act(() => workspaceRef.current!.maximizeTabset("right"));
      expect(screen.queryByTestId("content-1")).toBeNull();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();
      act(() => workspaceRef.current!.restoreTabset());
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
      unmount();

      // activity
      const log: string[] = [];
      const { workspaceRef: activityRef } = renderWorkspace({
        hiddenTabBehavior: "activity",
        renderTabContent: (tab) => <EffectLogger id={tab.id} log={log} />
      });
      expect(log).toContain("mount 1");
      act(() => activityRef.current!.maximizeTabset("right"));
      expect(log).toContain("unmount 1");
      expect(screen.getByTestId("content-1")).toBeInTheDocument();
      act(() => activityRef.current!.restoreTabset());
      expect(log.filter((entry) => entry === "mount 1")).toHaveLength(2);
    });

    test("unmount keeps the selected tab of a floating tabset mounted while another tabset is maximized", () => {
      const model = createModel();
      model.maximizedTabsetId = "right";
      model.floating = [
        {
          height: 200,
          id: "float",
          selectedId: "5",
          tabs: [tab("5")],
          type: "tabset",
          width: 300,
          x: 0,
          y: 0
        }
      ];
      renderWorkspace({ defaultModel: model, hiddenTabBehavior: "unmount" });

      expect(screen.getByTestId("content-5")).toBeInTheDocument();
      expect(screen.getByTestId("content-3")).toBeInTheDocument();
      expect(screen.queryByTestId("content-1")).toBeNull();
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

    function getTabIds(container: HTMLElement, tabsetId: string) {
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          `[data-tabset-id="${tabsetId}"] [data-tab]`
        )
      ).map((element) => element.dataset.tabId);
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
        isCopy: false,
        model: expect.anything(),
        source: "local",
        sourceInfo: undefined,
        sourceWorkspaceId: expect.any(String),
        tab: expect.objectContaining({ id: "2" }),
        target: { region: "center", tabsetId: "right" }
      });
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    test("a drop blocked by onBeforeModelChange doesn't move the tab", async () => {
      const onBeforeModelChange = vi.fn(() => false);
      const { container, onModelChanged } = renderWorkspace({
        onBeforeModelChange
      });

      await drag(getTab("2"), getPanels(container, "right"));

      expect(onBeforeModelChange).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "move", removedTabs: [] })
      );
      expect(getTabIds(container, "left")).toEqual(["1", "2"]);
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

    describe("copying (copyTab and copyTabset)", () => {
      const copyTab = (tab: TabNode<TabData>) => ({
        ...tab,
        id: `${tab.id}-copy`
      });

      // Drags with the copy modifier key (Ctrl, since jsdom's platform isn't an Apple one) held
      async function copyDrag(from: HTMLElement, to: HTMLElement) {
        const user = userEvent.setup();
        await user.keyboard("{Control>}");
        await user.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[MouseLeft>]",
            target: from
          },
          { coords: { clientX: 150, clientY: 150 }, target: to },
          { keys: "[/MouseLeft]", target: to }
        ]);
        await user.keyboard("{/Control}");
      }

      test("dropping a tab while the copy modifier key is held adds the copy, leaving the tab where it was", async () => {
        const spy = vi.fn(copyTab);
        const { container, onModelChanged } = renderWorkspace({
          copyTab: spy
        });

        await copyDrag(getTab("2"), getPanels(container, "right"));

        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }), {
          region: "center",
          tabsetId: "right"
        });
        expect(getTabIds(container, "left")).toEqual(["1", "2"]);
        expect(getTabIds(container, "right")).toEqual(["3", "2-copy"]);
        expect(onModelChanged).toHaveBeenCalledTimes(1);
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "copy"
        });
      });

      test("a copy can be dropped where a move would leave the layout unchanged (e.g. its own tabset)", async () => {
        const { container } = renderWorkspace({ copyTab });

        await copyDrag(getTab("2"), getPanels(container, "left"));

        expect(getTabIds(container, "left")).toEqual(["1", "2", "2-copy"]);
      });

      test("without the copyTab prop, tabs are moved", async () => {
        const { container, onModelChanged } = renderWorkspace();

        await copyDrag(getTab("2"), getPanels(container, "right"));

        expect(getTabIds(container, "left")).toEqual(["1"]);
        expect(getTabIds(container, "right")).toEqual(["3", "2"]);
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "move"
        });
      });

      test("the tab is moved if copyTab returns null", async () => {
        const { container, onModelChanged } = renderWorkspace({
          copyTab: () => null
        });

        await copyDrag(getTab("2"), getPanels(container, "right"));

        expect(getTabIds(container, "right")).toEqual(["3", "2"]);
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "move"
        });
      });

      test("a copy with an id that's in use is rejected (with a development warning), and the tab is moved", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        resetWarnOnceForTest();
        const { container } = renderWorkspace({ copyTab: (tab) => tab });

        await copyDrag(getTab("2"), getPanels(container, "right"));

        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining("copyTab returned a tab with an id")
        );
        expect(getTabIds(container, "left")).toEqual(["1"]);
        expect(getTabIds(container, "right")).toEqual(["3", "2"]);
      });

      test("disableDrop is told whether a copy would be dropped", async () => {
        const disableDrop = vi.fn(() => false);
        const { container } = renderWorkspace({ copyTab, disableDrop });

        await copyDrag(getTab("2"), getPanels(container, "right"));

        expect(disableDrop).toHaveBeenCalledWith(
          expect.objectContaining({ isCopy: true, source: "local" })
        );
      });

      test("pressing (and releasing) the copy modifier key mid-drag switches between copying and moving", async () => {
        const renderDragPreview = vi.fn(
          (tab: TabNode<TabData>, { isCopy }: { isCopy: boolean }) =>
            `${tab.id}${isCopy ? " (copy)" : ""}`
        );
        const { container } = renderWorkspace({ copyTab, renderDragPreview });

        const user = userEvent.setup();
        await user.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[MouseLeft>]",
            target: getTab("2")
          },
          {
            coords: { clientX: 150, clientY: 150 },
            target: getPanels(container, "right")
          }
        ]);
        const preview = () =>
          document.querySelector<HTMLElement>("[data-drag-preview]")!;
        expect(preview()).not.toHaveAttribute("data-drag-copy");
        expect(preview()).toHaveTextContent(/^2$/);

        await user.keyboard("{Control>}");
        expect(preview()).toHaveAttribute("data-drag-copy");
        expect(preview()).toHaveTextContent("2 (copy)");
        expect(document.querySelector("[data-drop-indicator]")).toHaveAttribute(
          "data-drag-copy"
        );

        await user.keyboard("{/Control}");
        expect(preview()).not.toHaveAttribute("data-drag-copy");

        await user.keyboard("{Control>}");
        await user.pointer({
          keys: "[/MouseLeft]",
          target: getPanels(container, "right")
        });
        await user.keyboard("{/Control}");
        expect(getTabIds(container, "left")).toEqual(["1", "2"]);
        expect(getTabIds(container, "right")).toEqual(["3", "2-copy"]);
      });

      test("a rejected copy isn't moved onto its own tabset's center (where a move is not valid)", async () => {
        const { container, onModelChanged } = renderWorkspace({
          copyTab: () => null
        });

        await copyDrag(getTab("2"), getPanels(container, "left"));

        expect(getTabIds(container, "left")).toEqual(["1", "2"]);
        expect(onModelChanged).not.toHaveBeenCalled();
      });

      test("a keepWhenEmpty tabset whose copy is declined isn't merged into another tabset", async () => {
        const model = createModel();
        (model.root as SplitNode<TabData>).children[0] = {
          ...((model.root as SplitNode<TabData>)
            .children[0] as TabsetNode<TabData>),
          keepWhenEmpty: true
        };
        const { container, onModelChanged } = renderWorkspace({
          copyTabset: () => null,
          defaultModel: model
        });

        await copyDrag(
          getHeader(container, "left"),
          container.querySelector<HTMLElement>(
            '[data-tabset-id="right"] [data-tab-list]'
          )!
        );

        expect(getTabIds(container, "left")).toEqual(["1", "2"]);
        expect(getTabIds(container, "right")).toEqual(["3"]);
        expect(onModelChanged).not.toHaveBeenCalled();
      });

      test("Escape cancels a drag while the copy modifier key is held", async () => {
        const { container, onModelChanged } = renderWorkspace({ copyTab });

        const user = userEvent.setup();
        await user.keyboard("{Control>}");
        await user.pointer([
          {
            coords: { clientX: 100, clientY: 100 },
            keys: "[MouseLeft>]",
            target: getTab("2")
          },
          {
            coords: { clientX: 150, clientY: 150 },
            target: getPanels(container, "right")
          }
        ]);
        expect(document.querySelector("[data-drag-preview]")).toHaveAttribute(
          "data-drag-copy"
        );

        await user.keyboard("{Escape}");
        expect(document.querySelector("[data-drag-preview]")).toBeNull();
        await user.keyboard("{/Control}");
        await user.pointer({
          keys: "[/MouseLeft]",
          target: getPanels(container, "right")
        });

        expect(getTabIds(container, "left")).toEqual(["1", "2"]);
        expect(getTabIds(container, "right")).toEqual(["3"]);
        expect(onModelChanged).not.toHaveBeenCalled();
      });

      describe("tabsets", () => {
        test("dropping a tabset while the copy modifier key is held adds the copy", async () => {
          const { container, onModelChanged } = renderWorkspace({
            copyTab,
            copyTabset: (tabset, copyTab) => ({
              ...tabset,
              id: "left-copy",
              tabs: tabset.tabs.map(copyTab)
            })
          });

          // The left edge of the right tabset's panels (jsdom has no layout, so every point is otherwise at the center)
          const panels = getPanels(container, "right");
          panels.getBoundingClientRect = () =>
            ({ height: 1000, left: 0, top: 0, width: 1000 }) as DOMRect;
          await copyDrag(getHeader(container, "left"), panels);

          expect(getTabIds(container, "left")).toEqual(["1", "2"]);
          expect(getTabIds(container, "left-copy")).toEqual([
            "1-copy",
            "2-copy"
          ]);
          expect(onModelChanged).toHaveBeenLastCalledWith(
            expect.objectContaining({
              root: expect.objectContaining({
                children: [
                  expect.objectContaining({ id: "left" }),
                  expect.objectContaining({
                    id: "left-copy",
                    // The copy of the selected tab is selected
                    selectedId: "1-copy"
                  }),
                  expect.objectContaining({ id: "right" })
                ]
              })
            }),
            { isUserInteraction: true, reason: "copy" }
          );
        });

        test("tabs are copied with new ids by copyTabset's copyTab argument without the copyTab prop", async () => {
          const { container } = renderWorkspace({
            copyTabset: (tabset, copyTab) => ({
              ...tabset,
              id: "left-copy",
              tabs: tabset.tabs.map(copyTab)
            })
          });

          await copyDrag(
            getHeader(container, "left"),
            getPanels(container, "right")
          );

          const ids = getTabIds(container, "right");
          expect(ids).toHaveLength(3);
          expect(ids[0]).toBe("3");
          expect(ids.slice(1)).not.toContain("1");
          expect(ids.slice(1)).not.toContain("2");
          expect(screen.getAllByRole("tab", { name: /^One/ }).length).toBe(2);
        });

        test("a copy with duplicate ids is rejected (with a development warning), and the tabset is moved", async () => {
          const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
          resetWarnOnceForTest();
          const { container } = renderWorkspace({
            copyTabset: (tabset) => ({
              ...tabset,
              id: "left-copy",
              tabs: tabset.tabs.map((tab) => ({ ...tab, id: "same" }))
            })
          });

          await copyDrag(
            getHeader(container, "left"),
            getPanels(container, "right")
          );

          expect(warn).toHaveBeenCalledWith(
            expect.stringContaining("duplicate ids")
          );
          expect(getTabIds(container, "right")).toEqual(["3", "1", "2"]);
        });

        test("without the copyTabset prop, tabsets are moved", async () => {
          const { container } = renderWorkspace({ copyTab });

          await copyDrag(
            getHeader(container, "left"),
            getPanels(container, "right")
          );

          expect(getTabIds(container, "right")).toEqual(["3", "1", "2"]);
        });
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
        expect(dataTransfer.effectAllowed).toBe("copyMove");
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

      describe("copying (copyTab)", () => {
        const copyTab = (tab: TabNode<TabData>) => ({
          ...tab,
          id: `${tab.id}-copy`
        });

        // Drops onto an element with the copy modifier key (Ctrl, since jsdom's platform isn't an Apple one) held
        function copyOnto(element: HTMLElement) {
          elementAtPoint = element;
          const dataTransfer = createDataTransfer();
          fireDragEvent("dragover", element, { ctrlKey: true }, dataTransfer);
          const { dropEffect } = dataTransfer;
          const isPreviewCopy = document
            .querySelector("[data-drag-preview]")
            ?.hasAttribute("data-drag-copy");
          fireDragEvent("drop", element, { ctrlKey: true }, dataTransfer);

          return { dropEffect, isPreviewCopy };
        }

        test("a tab dropped into another workspace while the copy modifier key is held is copied by that workspace", async () => {
          const { container, onModelChanged, onOtherModelChanged } =
            renderWorkspaces({}, { copyTab });

          await startDrag(getTab("2"));
          const { dropEffect, isPreviewCopy } = copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="other"] [data-tab-panels]'
            )!
          );

          // The preview is shown by the workspace the drag started in, which doesn't copy itself
          expect(dropEffect).toBe("copy");
          expect(isPreviewCopy).toBe(true);
          expect(
            container.querySelector('[data-tabset-id="other"]')
          ).toContainElement(getTab("2-copy"));
          expect(
            container.querySelector('[data-tabset-id="left"]')
          ).toContainElement(
            container.querySelector<HTMLElement>('[data-tab-id="2"]')
          );
          expect(onOtherModelChanged).toHaveBeenLastCalledWith(
            expect.anything(),
            {
              isUserInteraction: true,
              reason: "copy",
              sourceInfo: undefined,
              sourceWorkspaceId: "main"
            }
          );
          expect(onModelChanged).not.toHaveBeenCalled();
        });

        test("a copy blocked by onBeforeModelChange isn't moved instead", async () => {
          const { container, onModelChanged, onOtherModelChanged } =
            renderWorkspaces(
              {},
              {
                copyTab,
                onBeforeModelChange: ({ reason }) => reason !== "copy"
              }
            );

          await startDrag(getTab("2"));
          copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="other"] [data-tab-panels]'
            )!
          );

          expect(
            container.querySelector('[data-tabset-id="left"]')
          ).toContainElement(getTab("2"));
          expect(container.querySelectorAll("[data-tab]")).toHaveLength(4);
          expect(onModelChanged).not.toHaveBeenCalled();
          expect(onOtherModelChanged).not.toHaveBeenCalled();
        });

        test("a workspace without the copyTab prop moves the tab instead", async () => {
          const { container, onModelChanged, onOtherModelChanged } =
            renderWorkspaces({ copyTab });

          await startDrag(getTab("2"));
          const { dropEffect, isPreviewCopy } = copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="other"] [data-tab-panels]'
            )!
          );

          expect(dropEffect).toBe("move");
          expect(isPreviewCopy).toBe(false);
          expect(
            container.querySelector('[data-tabset-id="other"]')
          ).toContainElement(getTab("2"));
          expect(onOtherModelChanged).toHaveBeenLastCalledWith(
            expect.anything(),
            {
              isUserInteraction: true,
              reason: "transfer",
              sourceInfo: undefined,
              sourceWorkspaceId: "main"
            }
          );
          expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
            isUserInteraction: true,
            reason: "transfer"
          });
        });

        test("a workspace whose copyTab declines the copy moves the tab instead", async () => {
          const { container, onModelChanged, onOtherModelChanged } =
            renderWorkspaces({}, { copyTab: () => null });

          await startDrag(getTab("2"));
          copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="other"] [data-tab-panels]'
            )!
          );

          expect(
            container.querySelector('[data-tabset-id="other"]')
          ).toContainElement(getTab("2"));
          expect(
            container.querySelector('[data-tabset-id="left"]')
          ).not.toContainElement(
            container.querySelector<HTMLElement>('[data-tab-id="2"]')
          );
          expect(onOtherModelChanged).toHaveBeenLastCalledWith(
            expect.anything(),
            {
              isUserInteraction: true,
              reason: "transfer",
              sourceInfo: undefined,
              sourceWorkspaceId: "main"
            }
          );
          expect(onModelChanged).toHaveBeenCalledTimes(1);
        });

        test("nothing changes if the move a declined copy falls back to is rejected too", async () => {
          const { container, onModelChanged, onOtherModelChanged } =
            renderWorkspaces(
              {},
              {
                copyTab: () => null,
                defaultModel: {
                  root: {
                    id: "other",
                    selectedId: "2",
                    tabs: [tab("2")],
                    type: "tabset"
                  },
                  version: 1
                }
              }
            );

          await startDrag(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="left"] [data-tab-id="2"]'
            )!
          );
          copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="other"] [data-tab-panels]'
            )!
          );

          expect(getTabIds(container, "left")).toEqual(["1", "2"]);
          expect(onModelChanged).not.toHaveBeenCalled();
          expect(onOtherModelChanged).not.toHaveBeenCalled();
        });

        test("a tabset with the keepWhenEmpty flag can be copied into another workspace", async () => {
          const model = createModel();
          (model.root as SplitNode<TabData>).children[0] = {
            ...((model.root as SplitNode<TabData>)
              .children[0] as TabsetNode<TabData>),
            keepWhenEmpty: true
          };
          const { container, onModelChanged, onOtherModelChanged } =
            renderWorkspaces(
              { defaultModel: model },
              {
                copyTabset: (tabset, copyTab) => ({
                  ...tabset,
                  id: "left-copy",
                  tabs: tabset.tabs.map(copyTab)
                })
              }
            );

          await startDrag(getHeader(container, "left"));
          const { dropEffect } = copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="other"] [data-tab-panels]'
            )!
          );

          expect(dropEffect).toBe("copy");
          // The copy's tabs are merged into the tabset it's dropped on, and the kept tabset stays where it was
          expect(
            container.querySelectorAll('[data-tabset-id="other"] [data-tab]')
          ).toHaveLength(3);
          expect(
            container.querySelector('[data-tabset-id="left"]')
          ).toContainElement(
            container.querySelector<HTMLElement>('[data-tab-id="1"]')
          );
          expect(onOtherModelChanged).toHaveBeenLastCalledWith(
            expect.anything(),
            {
              isUserInteraction: true,
              reason: "copy",
              sourceInfo: undefined,
              sourceWorkspaceId: "main"
            }
          );
          expect(onModelChanged).not.toHaveBeenCalled();
        });

        test("a tab dropped within its own workspace while the copy modifier key is held is copied", async () => {
          const { container, onModelChanged } = renderWorkspaces({ copyTab });

          await startDrag(getTab("2"));
          const { dropEffect } = copyOnto(
            container.querySelector<HTMLElement>(
              '[data-tabset-id="left"] [data-tab-panels]'
            )!
          );

          expect(dropEffect).toBe("copy");
          expect(
            container.querySelector('[data-tabset-id="left"]')
          ).toContainElement(getTab("2-copy"));
          expect(
            container.querySelector('[data-tabset-id="left"]')
          ).toContainElement(
            container.querySelector<HTMLElement>('[data-tab-id="2"]')
          );
          expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
            isUserInteraction: true,
            reason: "copy"
          });
        });
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

      test("the dragSourceInfo prop of the workspace a tab is dragged from is passed to disableDrop and onModelChanged", async () => {
        const disableDrop = vi.fn(() => false);
        const { container, onOtherModelChanged } = renderWorkspaces(
          { dragSourceInfo: { app: "reports", schemaVersion: 3 } },
          { disableDrop }
        );

        await startDrag(getTab("2"));
        dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(disableDrop).toHaveBeenCalledWith(
          expect.objectContaining({
            source: "external",
            sourceInfo: { app: "reports", schemaVersion: 3 },
            sourceWorkspaceId: "main"
          })
        );
        expect(onOtherModelChanged).toHaveBeenLastCalledWith(
          expect.anything(),
          {
            isUserInteraction: true,
            reason: "transfer",
            sourceInfo: { app: "reports", schemaVersion: 3 },
            sourceWorkspaceId: "main"
          }
        );
      });

      test("a drop blocked by the workspace it's dropped into leaves the tab in the workspace it was dragged from", async () => {
        const onBeforeModelChange = vi.fn(() => false);
        const { container, onModelChanged, onOtherModelChanged } =
          renderWorkspaces(
            { dragSourceInfo: "main-info" },
            { onBeforeModelChange }
          );

        await startDrag(getTab("2"));
        dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(onBeforeModelChange).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: "transfer",
            removedTabs: [],
            sourceInfo: "main-info",
            sourceWorkspaceId: "main"
          })
        );
        expect(
          container.querySelector('[data-tabset-id="left"]')
        ).toContainElement(getTab("2"));
        expect(onModelChanged).not.toHaveBeenCalled();
        expect(onOtherModelChanged).not.toHaveBeenCalled();
      });

      test("the workspace a tab is dragged from can't block its removal once another workspace has added it", async () => {
        const onBeforeModelChange = vi.fn(() => false);
        const { container, onModelChanged } = renderWorkspaces({
          onBeforeModelChange
        });

        await startDrag(getTab("2"));
        dropOnto(
          container.querySelector<HTMLElement>(
            '[data-tabset-id="other"] [data-tab-panels]'
          )!
        );

        expect(onBeforeModelChange).not.toHaveBeenCalled();
        expect(
          container.querySelector('[data-tabset-id="other"]')
        ).toContainElement(getTab("2"));
        expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
          isUserInteraction: true,
          reason: "transfer"
        });
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
          {
            isUserInteraction: true,
            reason: "transfer",
            sourceInfo: undefined,
            sourceWorkspaceId: "main"
          }
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
          {
            isUserInteraction: true,
            reason: "transfer",
            sourceInfo: undefined,
            sourceWorkspaceId: "main"
          }
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
          reason: "transfer",
          sourceInfo: undefined,
          sourceWorkspaceId: "other-workspace"
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
          isCopy: false,
          model: expect.anything(),
          source: "external",
          sourceInfo: undefined,
          sourceWorkspaceId: "main",
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
          {
            isUserInteraction: true,
            reason: "transfer",
            sourceInfo: undefined,
            sourceWorkspaceId: "main"
          }
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
              sourceInfo: undefined,
              sourceWorkspaceId: "main",
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

        test("the source of a drag from another page is passed to disableDrop", async () => {
          const disableDrop = vi.fn(() => false);
          const { container } = renderWorkspaces({}, { disableDrop });

          postFromOtherPage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            sourceInfo: { app: "reports" },
            sourceWorkspaceId: "remote-workspace",
            type: "start"
          });
          await deliverMessages();

          dropOnto(getOtherPanels(container));

          expect(disableDrop).toHaveBeenCalledWith(
            expect.objectContaining({
              sourceInfo: { app: "reports" },
              sourceWorkspaceId: "remote-workspace"
            })
          );
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

        test("a tab dragged from another page and copied here isn't removed from that page", async () => {
          const { container, onOtherModelChanged } = renderWorkspaces(
            {},
            { copyTab: (tab) => ({ ...tab, id: `${tab.id}-copy` }) }
          );

          postFromOtherPage({
            dragGroup: "group",
            id: "remote",
            node: { tab: tab("9"), type: "tab" },
            source: { tabId: "9", type: "tab" },
            type: "start"
          });
          await deliverMessages();

          const panels = getOtherPanels(container);
          elementAtPoint = panels;
          fireDragEvent("dragover", panels, { ctrlKey: true });
          fireDragEvent("drop", panels, { ctrlKey: true });
          expect(
            container.querySelector('[data-tabset-id="other"]')
          ).toContainElement(getTab("9-copy"));
          expect(onOtherModelChanged).toHaveBeenLastCalledWith(
            expect.anything(),
            { isUserInteraction: true, reason: "copy" }
          );

          await deliverMessages();
          expect(messages).not.toContainEqual(
            expect.objectContaining({ type: "remove" })
          );
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

      test("an accepted tear-off isn't blocked by onBeforeModelChange", async () => {
        const onBeforeModelChange = vi.fn(() => false);
        const onTearOff = vi.fn(() => true);
        renderWorkspace({ onBeforeModelChange, onTearOff });

        await dragOutside(getTab("2"));

        expect(onTearOff).toHaveBeenCalledTimes(1);
        expect(onBeforeModelChange).not.toHaveBeenCalled();
        expect(screen.queryByRole("tab", { name: /^2/ })).toBeNull();
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

        test("a drop blocked by onBeforeModelChange doesn't add the tab", async () => {
          const onBeforeModelChange = vi.fn(() => false);
          const { container, onModelChanged, paletteItem } = renderWithPalette({
            props: { onBeforeModelChange }
          });

          await drag(paletteItem, getPanels(container, "right"));

          expect(onBeforeModelChange).toHaveBeenCalledWith(
            expect.objectContaining({ reason: "add" })
          );
          expect(screen.queryByRole("tab", { name: /New tab/ })).toBeNull();
          expect(onModelChanged).not.toHaveBeenCalled();
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
            isCopy: false,
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

        test("a drop blocked by onBeforeModelChange doesn't add the tab", () => {
          const onBeforeModelChange = vi.fn(() => false);
          const { container, onModelChanged } = renderAccepting({
            onBeforeModelChange
          });

          fireDragEvent(
            "drop",
            getPanels(container, "right"),
            createDataTransfer()
          );

          expect(onBeforeModelChange).toHaveBeenCalledWith(
            expect.objectContaining({ reason: "add" })
          );
          expect(screen.queryByRole("tab", { name: /New tab/ })).toBeNull();
          expect(onModelChanged).not.toHaveBeenCalled();
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
            isCopy: false,
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
          isCopy: false,
          model: expect.anything(),
          source: "local",
          sourceInfo: undefined,
          sourceWorkspaceId: expect.any(String),
          tab: expect.objectContaining({ id: "1" }),
          tabset,
          target
        });
        expect(disableDrop).toHaveBeenCalledWith({
          isCopy: false,
          model: expect.anything(),
          source: "local",
          sourceInfo: undefined,
          sourceWorkspaceId: expect.any(String),
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
          isCopy: false,
          model: expect.anything(),
          source: "local",
          sourceInfo: undefined,
          sourceWorkspaceId: expect.any(String),
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
