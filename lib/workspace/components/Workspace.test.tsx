import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { Group } from "../../flex/components/Group";
import { Panel } from "../../flex/components/Panel";
import { useParentPanel } from "../../flex/hooks/useParentPanel";
import { TabCloseButton } from "./TabCloseButton";
import type {
  ParentTab,
  ParentTabState,
  SplitNode,
  TabNode,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceProps
} from "../types";
import { useParentTab } from "../hooks/useParentTab";
import { useParentTabset } from "../hooks/useParentTabset";
import { useParentTabsetState } from "../hooks/useParentTabsetState";
import { useParentTabState } from "../hooks/useParentTabState";
import { useParentWorkspace } from "../hooks/useParentWorkspace";
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

  describe("dragging", () => {
    let elementAtPoint: Element | null = null;

    beforeEach(() => {
      document.elementFromPoint = () => elementAtPoint;
    });

    afterEach(() => {
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    });

    async function drag(from: HTMLElement, to: HTMLElement) {
      await userEvent.pointer([
        {
          coords: { clientX: 0, clientY: 0 },
          keys: "[MouseLeft>]",
          target: from
        },
        { coords: { clientX: 50, clientY: 50 }, target: to },
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

    test("disableDrop rejects targets", async () => {
      const disableDrop = vi.fn(() => true);
      const { container, onModelChanged } = renderWorkspace({ disableDrop });

      await drag(getTab("2"), getPanels(container, "right"));

      expect(disableDrop).toHaveBeenCalledWith({
        model: expect.anything(),
        tab: expect.objectContaining({ id: "2" }),
        target: { region: "center", tabsetId: "right" }
      });
      expect(onModelChanged).not.toHaveBeenCalled();
    });

    // Starts dragging a tab over the "right" tabset (without releasing the pointer)
    async function startDrag(container: HTMLElement, tabElement: HTMLElement) {
      // A single instance tracks the pointer's state between calls
      const user = userEvent.setup();
      await user.pointer([
        {
          coords: { clientX: 0, clientY: 0 },
          keys: "[MouseLeft>]",
          target: tabElement
        },
        {
          coords: { clientX: 50, clientY: 50 },
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
            coords: { clientX: 0, clientY: 0 },
            keys: "[TouchA>]",
            target: getTab("One")
          },
          {
            coords: { clientX: 50, clientY: 50 },
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
  });
});
