import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import type {
  TabNode,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceProps
} from "../types";
import { TabCloseButton } from "./TabCloseButton";
import { TabsetCollapseButton } from "./TabsetCollapseButton";
import { TabsetDragHandle } from "./TabsetDragHandle";
import { TabsetMaximizeButton } from "./TabsetMaximizeButton";
import { Workspace } from "./Workspace";

function tab(id: string): TabNode {
  return { data: null, id, title: `Tab ${id}` };
}

// A collapsible tabset ("left") beside one that isn't ("right"), and a floating tabset ("float")
function createModel(overrides: Partial<WorkspaceModel> = {}): WorkspaceModel {
  return {
    floating: [
      {
        height: 100,
        id: "float",
        tabs: [tab("3")],
        type: "tabset",
        width: 100,
        x: 0,
        y: 0
      }
    ],
    root: {
      children: [
        { collapsible: true, id: "left", tabs: [tab("1")], type: "tabset" },
        { id: "right", tabs: [tab("2")], type: "tabset" }
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1,
    ...overrides
  };
}

function renderWorkspace(props: Partial<WorkspaceProps> = {}) {
  const onModelChanged = vi.fn();
  const workspaceRef = createRef<WorkspaceImperativeHandle>();

  const result = render(
    <Workspace
      defaultModel={createModel()}
      onModelChanged={onModelChanged}
      renderTabContent={(tab) => <div>content {tab.id}</div>}
      workspaceRef={workspaceRef}
      {...props}
    />
  );

  return { ...result, onModelChanged, workspaceRef };
}

function getTabset(container: HTMLElement, tabsetId: string) {
  return container.querySelector<HTMLElement>(
    `[data-tabset-id="${tabsetId}"]`
  )!;
}

function getButton(
  container: HTMLElement,
  tabsetId: string,
  testId: string
): HTMLButtonElement | null {
  return getTabset(container, tabsetId).querySelector(
    `[data-testid="${testId}"]`
  );
}

describe("Workspace buttons", () => {
  beforeEach(() => {
    resetWarnOnceForTest();
  });

  describe("TabsetCollapseButton", () => {
    function renderCollapseButtons(props: Partial<WorkspaceProps> = {}) {
      return renderWorkspace({
        renderTabsetToolbar: () => (
          <TabsetCollapseButton
            className={({ isCollapsed }) =>
              isCollapsed ? "collapsed" : "expanded"
            }
            data-testid="collapse"
            style={({ isCollapsed }) => ({ opacity: isCollapsed ? 0.5 : 1 })}
            title={({ isCollapsed }) => (isCollapsed ? "Expand" : "Collapse")}
          >
            {({ isCollapsed }) => (isCollapsed ? "▸" : "▾")}
          </TabsetCollapseButton>
        ),
        ...props
      });
    }

    test("collapses and expands its tabset, resolving its props from the tabset's state", () => {
      const { container, onModelChanged, workspaceRef } =
        renderCollapseButtons();

      const button = getButton(container, "left", "collapse")!;
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-label", "Collapse tabset");
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(button).toHaveClass("expanded");
      expect(button).toHaveAttribute("title", "Collapse");
      expect(button).toHaveStyle({ opacity: "1" });
      expect(button).toHaveTextContent("▾");

      fireEvent.click(button);
      expect(workspaceRef.current!.getModel().root).toMatchObject({
        children: [{ collapsed: true, id: "left" }, { id: "right" }]
      });
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "collapse"
      });

      const collapsed = getButton(container, "left", "collapse")!;
      // The label doesn't change; aria-expanded describes the state
      expect(collapsed).toHaveAttribute("aria-label", "Collapse tabset");
      expect(collapsed).toHaveAttribute("aria-expanded", "false");
      expect(collapsed).toHaveClass("collapsed");
      expect(collapsed).toHaveAttribute("title", "Expand");
      expect(collapsed).toHaveStyle({ opacity: "0.5" });
      expect(collapsed).toHaveTextContent("▸");

      fireEvent.click(collapsed);
      expect(workspaceRef.current!.getModel().root).toMatchObject({
        children: [{ id: "left" }, { id: "right" }]
      });
      expect(
        getModelTabset(workspaceRef.current!.getModel(), "left")
      ).not.toHaveProperty("collapsed");
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "expand"
      });
    });

    test("controls the selected tab's panel", () => {
      const { container } = renderCollapseButtons();

      const panel = screen.getByText("content 1").closest('[role="tabpanel"]');
      expect(panel).toHaveAttribute("id");
      expect(getButton(container, "left", "collapse")).toHaveAttribute(
        "aria-controls",
        panel!.id
      );
    });

    test("renders nothing for tabsets that can't be collapsed, or while maximized", () => {
      const { container } = renderCollapseButtons({
        defaultModel: createModel({ maximizedTabsetId: "right" })
      });

      expect(getButton(container, "right", "collapse")).toBeNull();
      // Floating tabsets can always be collapsed
      expect(getButton(container, "float", "collapse")).not.toBeNull();

      const { container: other } = renderCollapseButtons({
        defaultModel: createModel({ maximizedTabsetId: "left" })
      });
      expect(
        other.querySelector('[data-tabset-id="left"] [data-testid="collapse"]')
      ).toBeNull();
    });

    test("collapses and expands floating tabsets", () => {
      const { container, workspaceRef } = renderCollapseButtons();

      fireEvent.click(getButton(container, "float", "collapse")!);
      expect(workspaceRef.current!.getModel().floating?.[0]).toMatchObject({
        collapsed: true
      });

      fireEvent.click(getButton(container, "float", "collapse")!);
      expect(workspaceRef.current!.getModel().floating?.[0]).not.toHaveProperty(
        "collapsed"
      );
    });

    test("preventDefault keeps the tabset as it is", () => {
      const { container, workspaceRef } = renderWorkspace({
        renderTabsetToolbar: () => (
          <TabsetCollapseButton
            data-testid="collapse"
            onClick={(event) => event.preventDefault()}
          />
        )
      });

      fireEvent.click(getButton(container, "left", "collapse")!);
      expect(
        getModelTabset(workspaceRef.current!.getModel(), "left")
      ).not.toHaveProperty("collapsed");
    });

    test("warns when rendered outside of a tabset", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<TabsetCollapseButton />);

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("TabsetCollapseButton must be rendered")
      );
      warn.mockRestore();
    });
  });

  describe("TabsetMaximizeButton", () => {
    function renderMaximizeButtons(props: Partial<WorkspaceProps> = {}) {
      return renderWorkspace({
        renderTabsetToolbar: () => (
          <TabsetMaximizeButton
            className={({ isMaximized }) =>
              isMaximized ? "maximized" : undefined
            }
            data-testid="maximize"
            title={({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}
          >
            {({ isMaximized }) => (isMaximized ? "restore" : "maximize")}
          </TabsetMaximizeButton>
        ),
        ...props
      });
    }

    test("maximizes and restores its tabset, resolving its props from the tabset's state", () => {
      const { container, onModelChanged, workspaceRef } =
        renderMaximizeButtons();

      const button = getButton(container, "left", "maximize")!;
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-label", "Maximize tabset");
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button).not.toHaveClass("maximized");
      expect(button).toHaveAttribute("title", "Maximize");
      expect(button).toHaveTextContent("maximize");

      fireEvent.click(button);
      expect(workspaceRef.current!.getModel().maximizedTabsetId).toBe("left");
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "maximize"
      });

      // The maximized tabset is shown in an overlay
      const maximized = container.querySelector<HTMLElement>(
        '[data-tabset-maximized] [data-testid="maximize"]'
      )!;
      expect(maximized).toHaveAttribute("aria-label", "Maximize tabset");
      expect(maximized).toHaveAttribute("aria-pressed", "true");
      expect(maximized).toHaveClass("maximized");
      expect(maximized).toHaveAttribute("title", "Restore");
      expect(maximized).toHaveTextContent("restore");

      fireEvent.click(maximized);
      expect(
        workspaceRef.current!.getModel().maximizedTabsetId
      ).toBeUndefined();
      expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
        isUserInteraction: true,
        reason: "restore"
      });
    });

    test("renders nothing for the only tabset or floating tabsets", () => {
      const { container } = renderMaximizeButtons();
      expect(getButton(container, "float", "maximize")).toBeNull();

      const { container: other } = renderMaximizeButtons({
        defaultModel: {
          root: { id: "only", tabs: [tab("1")], type: "tabset" },
          version: 1
        }
      });
      expect(getButton(other, "only", "maximize")).toBeNull();
    });

    test("preventDefault keeps the tabset as it is", () => {
      const { container, workspaceRef } = renderWorkspace({
        renderTabsetToolbar: () => (
          <TabsetMaximizeButton
            data-testid="maximize"
            onClick={(event) => event.preventDefault()}
          />
        )
      });

      fireEvent.click(getButton(container, "left", "maximize")!);
      expect(
        workspaceRef.current!.getModel().maximizedTabsetId
      ).toBeUndefined();
    });
  });

  describe("function props of the other buttons", () => {
    test("TabCloseButton resolves its props from its tab's title", () => {
      renderWorkspace({
        renderTab: (tab, props) => (
          <div {...props}>
            {tab.id}
            <TabCloseButton
              className={({ tabTitle }) =>
                `close-${tabTitle.replace(" ", "-")}`
              }
              style={() => ({ color: "red" })}
              title={({ tabTitle }) => `Close ${tabTitle} now`}
            >
              {({ tabTitle }) => `× ${tabTitle}`}
            </TabCloseButton>
          </div>
        )
      });

      const button = screen.getByRole("button", { name: "Close Tab 1" });
      expect(button).toHaveClass("close-Tab-1");
      expect(button).toHaveStyle({ color: "rgb(255, 0, 0)" });
      expect(button).toHaveAttribute("title", "Close Tab 1 now");
      expect(button).toHaveTextContent("× Tab 1");
    });

    test("TabsetDragHandle resolves its props from whether the tabset can be dragged", () => {
      const { container } = renderWorkspace({
        disabled: true,
        renderTabsetToolbar: () => (
          <TabsetDragHandle
            className={({ isDisabled }) => (isDisabled ? "off" : "on")}
            data-testid="handle"
            style={() => ({ color: "red" })}
            title={({ isDisabled }) => (isDisabled ? undefined : "Drag")}
          >
            {({ isDisabled }) => (isDisabled ? "-" : "⠿")}
          </TabsetDragHandle>
        )
      });

      const handle = getButton(container, "left", "handle")!;
      expect(handle).toHaveClass("off");
      expect(handle).not.toHaveAttribute("title");
      expect(handle).toHaveTextContent("-");
      // Disabled handles don't take over touch gestures
      expect(handle).toHaveStyle({ color: "rgb(255, 0, 0)" });
      expect(handle.style.touchAction).not.toBe("none");
    });

    test("TabsetDragHandle adds touch-action to a function style", () => {
      const { container } = renderWorkspace({
        renderTabsetToolbar: () => (
          <TabsetDragHandle
            className={({ isDisabled }) => (isDisabled ? "off" : "on")}
            data-testid="handle"
            style={() => ({ color: "red" })}
          >
            {({ isDisabled }) => (isDisabled ? "-" : "⠿")}
          </TabsetDragHandle>
        )
      });

      const handle = getButton(container, "left", "handle")!;
      expect(handle).toHaveClass("on");
      expect(handle).toHaveTextContent("⠿");
      expect(handle).toHaveStyle({ color: "rgb(255, 0, 0)" });
      expect(handle.style.touchAction).toBe("none");
    });
  });
});

function getModelTabset(model: WorkspaceModel, tabsetId: string) {
  const root = model.root;
  return root.type === "split"
    ? root.children.find((child) => child.id === tabsetId)
    : root;
}
