import { vi } from "vitest";
import type {
  Orientation,
  RegisteredGroup
} from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import { setElementBounds } from "../../utils/test/mockBoundingClientRect";

type Type = "panel" | "separator" | "other";

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
  orientation: Orientation = "horizontal",
  groupIdStable?: string
): MockGroup {
  let panelIdCounter = 0;
  let separatorIdCounter = 0;

  const groupId = groupIdStable ?? `group-${++groupIdCounter}`;

  const groupElement = document.createElement("div");
  groupElement.setAttribute("data-group-id", groupId);

  setElementBounds(groupElement, groupBounds);

  const mockPanels: Set<RegisteredPanel> = new Set();
  const mockSeparators: Set<RegisteredSeparator> = new Set();

  const relativeBoundsToBounds = (relativeBounds: DOMRect) =>
    new DOMRect(
      groupBounds.x + relativeBounds.x,
      groupBounds.y + relativeBounds.y,
      relativeBounds.width,
      relativeBounds.height
    );

  const group = {
    defaultLayout: undefined,
    disableCursor: false,
    disabled: false,
    element: groupElement,
    id: groupId,
    inMemoryLayouts: {},
    orientation,

    get panels() {
      return Array.from(mockPanels.values());
    },
    get separators() {
      return Array.from(mockSeparators.values());
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
        case "separator": {
          const separator = mockSeparator(
            `${groupId}-${childId ?? ++separatorIdCounter}`,
            bounds
          );

          mockSeparators.add(separator);

          groupElement.appendChild(separator.element);

          return () => {
            mockSeparators.delete(separator);

            groupElement.removeChild(separator.element);
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

export function mockSeparator(
  separatorId: string,
  bounds: DOMRect = new DOMRect()
) {
  const childElement = document.createElement("div");
  childElement.setAttribute("data-separator-id", separatorId);

  setElementBounds(childElement, bounds);

  const separator: RegisteredSeparator = {
    element: childElement,
    id: separatorId
  };

  return separator;
}

export function resetMockGroupIdCounter() {
  groupIdCounter = 0;
}
