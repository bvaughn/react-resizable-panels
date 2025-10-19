import { PanelData } from "../Panel";
import { PanelGroupStorage } from "../PanelGroup";

export type PanelLayoutItem = {
  panelId: string;
  size: number;
};

export type PanelConfigurationState = {
  expandToSizes: {
    [panelId: string]: number;
  };
  layout: PanelLayoutItem[];
};

export type SerializedPanelGroupState = {
  [panelIds: string]: PanelConfigurationState;
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
        return order
          ? `${order}:${JSON.stringify(constraints)}`
          : JSON.stringify(constraints);
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

export function loadPanelGroupState(
  autoSaveId: string,
  panels: PanelData[],
  storage: PanelGroupStorage
): { layout: number[]; expandToSizes: Record<string, number> } | null {
  const state = loadSerializedPanelGroupState(autoSaveId, storage) ?? {};
  const panelKey = getPanelKey(panels);
  const savedState = state[panelKey];

  if (!savedState) {
    return null;
  }

  // Handle both old format (number[]) and new format (PanelLayoutItem[])
  let layout: number[];
  if (Array.isArray(savedState.layout)) {
    if (
      savedState.layout.length > 0 &&
      typeof savedState.layout[0] === "object" &&
      savedState.layout[0] !== null &&
      "panelId" in savedState.layout[0]
    ) {
      // New format: PanelLayoutItem[]
      const layoutWithIds = savedState.layout as PanelLayoutItem[];

      // Create a map of panelId to value for quick lookup
      const panelIdToValue = new Map<string, number>();
      layoutWithIds.forEach((item) => {
        panelIdToValue.set(item.panelId, item.size);
      });

      // Map the layout to match current panel order
      layout = panels.map((panel) => panelIdToValue.get(panel.id) || 0);

      // If we don't have values for all panels, fall back to null
      if (
        layout.some((size) => size === 0) &&
        layoutWithIds.length !== panels.length
      ) {
        return null;
      }
    } else {
      // Old format: number[] - need to cast through unknown to handle type mismatch
      layout = savedState.layout as unknown as number[];
    }
  } else {
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

  // Convert number[] layout to PanelLayoutItem[] with panel IDs
  const layoutWithIds: PanelLayoutItem[] = sizes.map((size, index) => ({
    panelId: panels[index]?.id || `panel-${index}`,
    size,
  }));

  state[panelKey] = {
    expandToSizes: Object.fromEntries(panelSizesBeforeCollapse.entries()),
    layout: layoutWithIds,
  };

  try {
    storage.setItem(panelGroupKey, JSON.stringify(state));
  } catch (error) {
    console.error(error);
  }
}
