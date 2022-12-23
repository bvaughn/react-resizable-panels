import { PanelData } from "../types";

type SerializedPanelGroupState = { [panelIds: string]: number[] };

function loadSerializedPanelGroupState(
  autoSaveId: string
): SerializedPanelGroupState | null {
  try {
    const serialized = localStorage.getItem(`PanelGroup:sizes:${autoSaveId}`);
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
  panelIds: string[]
): number[] | null {
  const state = loadSerializedPanelGroupState(autoSaveId);
  if (state) {
    return state[panelIds.join(",")] ?? null;
  }

  return null;
}

export function savePanelGroupLayout(
  autoSaveId: string,
  panelIds: string[],
  sizes: number[]
): void {
  const state = loadSerializedPanelGroupState(autoSaveId) || {};
  state[panelIds.join(",")] = sizes;

  try {
    localStorage.setItem(
      `PanelGroup:sizes:${autoSaveId}`,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error(error);
  }
}
