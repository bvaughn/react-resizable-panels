import { PanelData } from "../Panel";
import { PanelGroupStorage } from "../PanelGroup";

export type PanelGroupState = {
  expandToSizes: {
    [panelId: string]: number;
  };
  layout: number[];
  panelSizes?: Record<string, number>;
};

function getPanelGroupKey(autoSaveId: string): string {
  return `react-resizable-panels:${autoSaveId}`;
}

// Note that Panel ids might be user-provided (stable) or useId generated (non-deterministic)
// so they should not be used as part of the serialization key.
// Using the min/max size attributes should work well enough as a backup.
// Pre-sorting by minSize allows remembering layouts even if panels are re-ordered/dragged.
/*
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
*/

function loadSerializedPanelGroupState(
  autoSaveId: string,
  storage: PanelGroupStorage
): PanelGroupState | null {
  try {
    const panelGroupKey = getPanelGroupKey(autoSaveId);
    const serialized = storage.getItem(panelGroupKey);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (typeof parsed === "object" && parsed != null) {
        return parsed as PanelGroupState;
      }
    }
  } catch (error) {}

  return null;
}
function removeLayoutItem(
  oldKey: string,
  oldState: PanelGroupState,
  newKey: string
) {
  const oldValues = oldKey
    .split(",")
    .reduce<Record<string, number>>((acc, panelKey: string, i) => {
      acc[panelKey] = oldState.layout[i] || 0;
      return acc;
    }, {});

  const newValues = newKey.split(",").reduce<number[]>((acc, newKey) => {
    const oldValue = oldValues[newKey];
    if (oldValue) {
      acc.push(oldValue);
    }
    return acc;
  }, []);
  return newValues;
}
export function loadPanelGroupState(
  autoSaveId: string,
  panels: PanelData[],
  storage: PanelGroupStorage
): PanelGroupState | null {
  const state = loadSerializedPanelGroupState(autoSaveId, storage);
  if (!state) {
    return null;
  }

  return {
    expandToSizes: state.expandToSizes || {},
    layout: panels.map(({ id }) => state?.panelSizes?.[id] || 0),
    panelSizes: state.panelSizes || {},
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
  const oldState = loadPanelGroupState(autoSaveId, panels, storage);
  const newState = {
    expandToSizes: Object.fromEntries(panelSizesBeforeCollapse.entries()),
    panelSizes: {
      ...oldState?.panelSizes,
      ...panels.reduce<Record<string, number>>((acc, panel, i) => {
        acc[panel.id] = sizes[i] || 0;
        return acc;
      }, {}),
    },
  };

  try {
    storage.setItem(panelGroupKey, JSON.stringify(newState));
  } catch (error) {
    console.error(error);
  }
}
