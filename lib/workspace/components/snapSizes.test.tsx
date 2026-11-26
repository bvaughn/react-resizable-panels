// @vitest-environment jsdom

import { act, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  getMountedAxisState,
  getRegisteredAxis
} from "../../global/mutable-state/axes";
import { setElementBoundsFunction } from "../../shared/utils/test/mockBoundingClientRect";
import type {
  SplitNode,
  TabsetNode,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceProps
} from "../types";
import { Workspace } from "./Workspace";

// The root split is 100px wide, so pixels and percentages are interchangeable
beforeEach(() => {
  setElementBoundsFunction((element) => {
    if (element.hasAttribute("data-group")) {
      return new DOMRect(0, 0, 100, 50);
    }

    switch (element.id) {
      case "workspace:left": {
        return new DOMRect(0, 0, 50, 50);
      }
      case "workspace:right": {
        return new DOMRect(50, 0, 50, 50);
      }
    }

    if (element.hasAttribute("data-separator")) {
      return new DOMRect(50, 0, 0, 50);
    }
  });
});

function createModel(left: Partial<TabsetNode> = {}): WorkspaceModel {
  return {
    root: {
      children: [
        {
          id: "left",
          tabs: [{ data: null, id: "1" }],
          type: "tabset",
          ...left
        },
        { id: "right", tabs: [{ data: null, id: "2" }], type: "tabset" }
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1
  };
}

function renderWorkspace(
  left: Partial<TabsetNode> = {},
  props: Partial<WorkspaceProps> = {}
) {
  const onModelChanged = vi.fn();
  const workspaceRef = createRef<WorkspaceImperativeHandle>();

  const result = render(
    <Workspace
      defaultModel={createModel(left)}
      id="workspace"
      onModelChanged={onModelChanged}
      renderTabContent={() => null}
      workspaceRef={workspaceRef}
      {...props}
    />
  );

  return {
    ...result,
    getLeftSize: () =>
      (workspaceRef.current!.getModel().root as SplitNode).children[0].size,
    getShownLayout: () => getMountedAxisState("workspace-root")!.layout,
    getSnapSizes: () =>
      getRegisteredAxis("workspace-root", true).items.find(
        ({ id }) => id === "workspace:left"
      )?.constraintProps.snapSizes,
    onModelChanged,
    workspaceRef
  };
}

describe("Workspace snapSizes", () => {
  test("tabsets pass their snap widths as constraints within horizontal splits", () => {
    const { getSnapSizes } = renderWorkspace({
      snapHeights: [10],
      snapWidths: [25, "50", "75px"]
    });

    expect(getSnapSizes()).toEqual(["25%", "50", "75px"]);
  });

  test("tabsets pass their snap heights as constraints within vertical splits", () => {
    const model = createModel({ snapHeights: [30], snapWidths: [25] });
    (model.root as SplitNode).orientation = "vertical";

    render(
      <Workspace
        defaultModel={model}
        id="workspace"
        renderTabContent={() => null}
      />
    );

    expect(
      getRegisteredAxis("workspace-root", true).items.find(
        ({ id }) => id === "workspace:left"
      )?.constraintProps.snapSizes
    ).toEqual(["30%"]);
  });

  test("snapBehavior is passed to splits", () => {
    renderWorkspace();
    expect(getRegisteredAxis("workspace-root", true).snapBehavior).toBe(
      "on-drag"
    );
  });

  test("snapBehavior can snap once separators are released", () => {
    renderWorkspace({}, { snapBehavior: "on-release" });
    expect(getRegisteredAxis("workspace-root", true).snapBehavior).toBe(
      "on-release"
    );
  });

  test("tabsets are shown at their nearest snap sizes without changing the model", () => {
    const { getLeftSize, getShownLayout, onModelChanged } = renderWorkspace({
      size: 40,
      snapWidths: [25, 50]
    });

    expect(getShownLayout()).toEqual({
      "workspace:left": 50,
      "workspace:right": 50
    });
    expect(getLeftSize()).toBe(40);
    expect(onModelChanged).not.toHaveBeenCalled();
  });

  test("updateTabset changes snap sizes", () => {
    const { getShownLayout, getSnapSizes, workspaceRef } = renderWorkspace({
      size: 40,
      snapWidths: [25, 50]
    });

    act(() => {
      workspaceRef.current!.updateTabset("left", { snapWidths: [30] });
    });
    expect(getSnapSizes()).toEqual(["30%"]);
    expect(getShownLayout()["workspace:left"]).toBe(30);

    act(() => {
      workspaceRef.current!.updateTabset("left", { snapWidths: undefined });
    });
    expect(getSnapSizes()).toBeUndefined();
  });

  test("resizing from the keyboard moves to the next snap size and updates the model", () => {
    const { container, getLeftSize, getShownLayout, onModelChanged } =
      renderWorkspace({
        size: 50,
        snapWidths: [25, 50, 75]
      });

    const separator = container.querySelector<HTMLElement>("[data-separator]")!;
    act(() => {
      separator.focus();
    });
    fireEvent.keyDown(separator, { key: "ArrowRight" });

    expect(getShownLayout()["workspace:left"]).toBe(75);
    expect(getLeftSize()).toBe(75);
    expect(onModelChanged).toHaveBeenLastCalledWith(expect.anything(), {
      isUserInteraction: true,
      reason: "resize"
    });
  });

  test("dragging a separator writes the snapped size to the model", async () => {
    const user = userEvent.setup();
    const { container, getLeftSize, getShownLayout, onModelChanged } =
      renderWorkspace({ size: 50, snapWidths: [25, 50, 75] });

    const separator = container.querySelector<HTMLElement>("[data-separator]")!;
    await user.pointer({
      keys: "[MouseLeft>]",
      target: separator,
      coords: { clientX: 50, clientY: 25 }
    });
    await user.pointer({ coords: { clientX: 68, clientY: 25 } });
    await user.pointer({ keys: "[/MouseLeft]" });

    expect(getShownLayout()["workspace:left"]).toBe(75);
    expect(getLeftSize()).toBe(75);
    expect(onModelChanged).toHaveBeenCalled();
  });
});
