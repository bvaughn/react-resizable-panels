import { vi } from "vitest";
import type { PanelConstraintProps } from "../../components/panel/types";
import { setElementBounds } from "../../utils/test/mockBoundingClientRect";
import type {
  Orientation,
  RegisteredResizeAxis,
  RegisteredResizeItem,
  RegisteredSeparator
} from "../types";

export type MockGroup = RegisteredResizeAxis & {
  addHTMLElement: (relativeBounds: DOMRect) => () => void;
  addPanel: (
    relativeBounds: DOMRect,
    id?: string,
    constraints?: Partial<PanelConstraintProps>
  ) => () => void;
  addSeparator: (
    relativeBounds: DOMRect,
    id?: string,
    disabled?: boolean
  ) => () => void;
};

let groupIdCounter = 0;

export function mockGroup(
  groupBounds: DOMRect,
  config: Partial<RegisteredResizeAxis> = {}
): MockGroup {
  const groupId = config.id ?? `group-${++groupIdCounter}`;

  let panelIdCounter = 0;
  let separatorIdCounter = 0;

  const groupElement = document.createElement("div");
  groupElement.setAttribute("data-group", groupId);

  setElementBounds(groupElement, groupBounds);

  const mockPanels: Set<RegisteredResizeItem> = new Set();
  const mockSeparators: Set<RegisteredSeparator> = new Set();

  const relativeBoundsToBounds = (relativeBounds: DOMRect) =>
    new DOMRect(
      groupBounds.x + relativeBounds.x,
      groupBounds.y + relativeBounds.y,
      relativeBounds.width,
      relativeBounds.height
    );

  const group = {
    disabled: false,
    element: groupElement,
    id: groupId,
    mutableState: {
      defaultLayout: undefined,
      disableCursor: false,
      expandedItemSizes: {},
      layouts: {}
    },
    orientation: "horizontal" as Orientation,
    resizePreviewMode: "panel" as const,
    resizeTargetMinimumSize: {
      coarse: 20,
      fine: 10
    },
    ...config,

    get items() {
      return Array.from(mockPanels.values());
    },
    get separators() {
      return Array.from(mockSeparators.values());
    },

    // Test specific code
    addHTMLElement: (relativeBounds: DOMRect) => {
      const element = document.createElement("div");

      setElementBounds(element, relativeBoundsToBounds(relativeBounds));

      groupElement.appendChild(element);

      return function removeHTMLElement() {
        groupElement.removeChild(element);
      };
    },

    addPanel: (
      relativeBounds: DOMRect,
      id: string = `${++panelIdCounter}`,
      constraints: Partial<PanelConstraintProps> = {}
    ) => {
      const panelId = `${groupId}-${id}`;

      const element = document.createElement("div");
      element.setAttribute("data-panel", panelId);
      if (constraints?.disabled) {
        element.setAttribute("data-disabled", "");
      }

      setElementBounds(element, relativeBoundsToBounds(relativeBounds));

      const panel: RegisteredResizeItem = {
        element,
        id: panelId,
        idIsStable: true,
        mutableValues: {
          expandToSize: undefined,
          prevSize: undefined
        },
        constraintProps: constraints,
        onResize: vi.fn()
      };

      mockPanels.add(panel);

      groupElement.appendChild(element);

      return function removePanel() {
        mockPanels.delete(panel);

        groupElement.removeChild(element);
      };
    },

    addSeparator: (
      relativeBounds: DOMRect,
      id: string = `${groupId}-${++separatorIdCounter}`,
      disabled?: boolean,
      disableDoubleClick?: boolean
    ) => {
      const separatorId = `${groupId}-${id}`;

      const element = document.createElement("div");
      element.setAttribute("data-separator", separatorId);
      if (disabled) {
        element.setAttribute("aria-disabled", "");
      }

      setElementBounds(element, relativeBoundsToBounds(relativeBounds));

      const separator: RegisteredSeparator = {
        disabled,
        disableDoubleClick,
        element,
        id: separatorId
      };

      mockSeparators.add(separator);

      groupElement.appendChild(element);

      return function removeSeparator() {
        mockSeparators.delete(separator);

        groupElement.removeChild(element);
      };
    }
  };

  return group;
}

export function resetMockGroupIdCounter() {
  groupIdCounter = 0;
}
