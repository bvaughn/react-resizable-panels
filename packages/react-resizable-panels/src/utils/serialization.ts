import { PanelData } from "../Panel";
import { PanelGroupStorage } from "../PanelGroup";

type SerializedPanelGroupState = { [panelIds: string]: number[] };

// Note that Panel ids might be user-provided (stable) or useId generated (non-deterministic)
// so they should not be used as part of the serialization key.
// Using the min/max size attributes should work well enough as a backup.
// Pre-sorting by minSize allows remembering layouts even if panels are re-ordered/dragged.
function getSerializationKey(panels: PanelData[]): string {
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
    const serialized = storage.getItem(`PanelGroup:sizes:${autoSaveId}`);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (typeof parsed === "object" && parsed != null) {
        return parsed;
      }
    }
  } catch (error) {}

  return null;
}

export function loadPanelLayout(
  autoSaveId: string,
  panels: PanelData[],
  storage: PanelGroupStorage
): number[] | null {
  const state = loadSerializedPanelGroupState(autoSaveId, storage);
  if (state) {
    const key = getSerializationKey(panels);
    return state[key] ?? null;
  }

  return null;
}

export function savePanelGroupLayout(
  autoSaveId: string,
  panels: PanelData[],
  sizes: number[],
  storage: PanelGroupStorage
): void {
  const key = getSerializationKey(panels);
  const state = loadSerializedPanelGroupState(autoSaveId, storage) || {};
  state[key] = sizes;

  try {
    storage.setItem(`PanelGroup:sizes:${autoSaveId}`, JSON.stringify(state));
  } catch (error) {
    console.error(error);
  }
}
