import { PanelData } from "../Panel";
import { PanelGroupStorage } from "../PanelGroup";

export type PanelLayoutItem = {
  order: number;
  size: number;
};

export type PanelConfigurationState = {
  expandToSizes: {
    [panelId: string]: number;
  };
  layout: number[];
};

export type PanelSerializedConfigurationState = {
  expandToSizes: {
    [panelId: string]: number;
  };
  layout: PanelLayoutItem[] | number[];
};

export type SerializedPanelGroupState = {
  [panelIds: string]: PanelSerializedConfigurationState;
};

export const DEFAULT_STORAGE_KEY_PREFIX = "react-resizable-panels";

export function getPanelGroupKey(
  autoSaveId: string,
  prefix = DEFAULT_STORAGE_KEY_PREFIX
): string {
  return `${prefix}:${autoSaveId}`;
}

// Note that Panel ids might be user-provided (stable) or useId generated (non-deterministic)
// so they should not be used as part of the serialization key.
// Using the min/max size attributes should work well enough as a backup.
// Pre-sorting by minSize allows remembering layouts even if panels are re-ordered/dragged.
function getPanelKey(panels: PanelData[]): string {
  return panels
    .map((panel) => {
      const { constraints, id, idIsFromProps, order } = panel;
      if (idIsFromProps) {
        return id;
      } else {
        return `${order}:${JSON.stringify(constraints)}`;
      }
    })
    .sort((a, b) => a.localeCompare(b))
    .join(",");
}

function loadSerializedPanelGroupState(
  autoSaveId: string,
  storage: PanelGroupStorage
): SerializedPanelGroupState | null {
  try {
    const panelGroupKey = getPanelGroupKey(autoSaveId);
    const serialized = storage.getItem(panelGroupKey);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (typeof parsed === "object" && parsed != null) {
        return parsed as SerializedPanelGroupState;
      }
    }
  } catch (error) {}

  return null;
}

function isOldFormat(
  savedLayout: PanelSerializedConfigurationState["layout"]
): savedLayout is number[] {
  return savedLayout.every((item) => typeof item === "number");
}

function parseLayoutFromSavedState(
  savedLayout: PanelSerializedConfigurationState["layout"],
  panels: PanelData[]
): number[] | null {
  if (isOldFormat(savedLayout)) {
    return savedLayout;
  }

  const orderToValue = new Map<number, number>();
  savedLayout.forEach((item) => {
    orderToValue.set(item.order, item.size);
  });

  const layout = panels.map((panel) => {
    const order = panel.order;
    return orderToValue.get(order) || 0;
  });

  if (
    layout.some((size) => size === 0) &&
    savedLayout.length !== panels.length
  ) {
    return null;
  }

  return layout;
}

export function loadPanelGroupState(
  autoSaveId: string,
  panels: PanelData[],
  storage: PanelGroupStorage
): PanelConfigurationState | null {
  const state = loadSerializedPanelGroupState(autoSaveId, storage) ?? {};
  const panelKey = getPanelKey(panels);
  const savedState = state[panelKey];

  if (!savedState) {
    return null;
  }

  const layout = parseLayoutFromSavedState(savedState.layout, panels);
  if (!layout) {
    return null;
  }

  return {
    layout,
    expandToSizes: savedState.expandToSizes || {},
  };
}

export function savePanelGroupState(
  autoSaveId: string,
  panels: PanelData[],
  panelSizesBeforeCollapse: Map<string, number>,
  sizes: number[],
  storage: PanelGroupStorage
): void {
  const panelGroupKey = getPanelGroupKey(autoSaveId);
  const panelKey = getPanelKey(panels);
  const state = loadSerializedPanelGroupState(autoSaveId, storage) ?? {};

  const layout: PanelLayoutItem[] = sizes.map((size, index) => {
    const panel = panels[index];
    if (!panel) {
      throw new Error(
        `No panel found at index ${index} while saving panel group state`
      );
    }
    const order = panel.order;
    return { order, size };
  });

  state[panelKey] = {
    expandToSizes: Object.fromEntries(panelSizesBeforeCollapse.entries()),
    layout,
  };

  try {
    storage.setItem(panelGroupKey, JSON.stringify(state));
  } catch (error) {
    console.error(error);
  }
}
