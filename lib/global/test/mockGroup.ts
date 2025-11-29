import { vi } from "vitest";
import type {
  Direction,
  RegisteredGroup,
  StorageType
} from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredResizeHandle } from "../../components/resize-handle/types";
import { setElementBounds } from "../../utils/test/mockBoundingClientRect";

type Type = "panel" | "resize-handle" | "other";

export type MockGroup = RegisteredGroup & {
  addChild: (
    type: Type,
    relativeBounds: DOMRect,
    childId?: string | number
  ) => () => void;
};

let groupIdCounter = 0;

export function mockGroup(
  groupBounds: DOMRect,
  direction: Direction = "horizontal",
  groupIdStable?: string
): MockGroup {
  let panelIdCounter = 0;
  let resizeHandleIdCounter = 0;

  const groupId = groupIdStable ?? `group-${++groupIdCounter}`;

  const groupElement = document.createElement("div");
  groupElement.setAttribute("data-group-id", groupId);

  setElementBounds(groupElement, groupBounds);

  const mockPanels: Set<RegisteredPanel> = new Set();
  const mockResizeHandles: Set<RegisteredResizeHandle> = new Set();

  const relativeBoundsToBounds = (relativeBounds: DOMRect) =>
    new DOMRect(
      groupBounds.x + relativeBounds.x,
      groupBounds.y + relativeBounds.y,
      relativeBounds.width,
      relativeBounds.height
    );

  const group = {
    autoSave: false,
    direction,
    disableCursor: false,
    disabled: false,
    element: groupElement,
    id: groupId,
    storageType: "localStorage" as StorageType,

    get panels() {
      return Array.from(mockPanels.values());
    },
    get resizeHandles() {
      return Array.from(mockResizeHandles.values());
    },

    // Test specific code
    addChild: (
      type: Type,
      relativeBounds: DOMRect,
      childId?: string | number
    ) => {
      const bounds = relativeBoundsToBounds(relativeBounds);

      switch (type) {
        case "other": {
          const childElement = document.createElement("div");

          setElementBounds(childElement, bounds);

          groupElement.appendChild(childElement);

          return () => {
            groupElement.removeChild(childElement);
          };
        }
        case "panel": {
          const panel = mockPanel(
            `${groupId}-${childId ?? ++panelIdCounter}`,
            bounds
          );

          mockPanels.add(panel);

          groupElement.appendChild(panel.element);

          return () => {
            mockPanels.delete(panel);

            groupElement.removeChild(panel.element);
          };
        }
        case "resize-handle": {
          const resizeHandle = mockResizeHandle(
            `${groupId}-${childId ?? ++resizeHandleIdCounter}`,
            bounds
          );

          mockResizeHandles.add(resizeHandle);

          groupElement.appendChild(resizeHandle.element);

          return () => {
            mockResizeHandles.delete(resizeHandle);

            groupElement.removeChild(resizeHandle.element);
          };
        }
      }
    }
  };

  return group;
}

export function mockPanel(panelId: string, bounds: DOMRect = new DOMRect()) {
  const childElement = document.createElement("div");
  childElement.setAttribute("data-panel-id", panelId);

  setElementBounds(childElement, bounds);

  const panel: RegisteredPanel = {
    element: childElement,
    id: panelId,
    idIsStable: true,
    panelConstraints: {},
    onResize: vi.fn()
  };

  return panel;
}

export function mockResizeHandle(
  resizeHandleId: string,
  bounds: DOMRect = new DOMRect()
) {
  const childElement = document.createElement("div");
  childElement.setAttribute("data-resize-handle-id", resizeHandleId);

  setElementBounds(childElement, bounds);

  const resizeHandle: RegisteredResizeHandle = {
    element: childElement,
    id: resizeHandleId
  };

  return resizeHandle;
}

export function resetMockGroupIdCounter() {
  groupIdCounter = 0;
}
