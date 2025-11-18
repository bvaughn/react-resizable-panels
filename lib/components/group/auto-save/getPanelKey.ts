import type { RegisteredPanel } from "../../panel/types";

// TODO Do we need to require `order` prop here?

// Note that Panel ids might be user-provided (stable) or useId generated (non-deterministic)
// so they should not be used as part of the serialization key.
// Using the min/max size attributes should work well enough as a backup.
// Pre-sorting by minSize allows remembering layouts even if panels are re-ordered/dragged.
export function getPanelKey(panels: RegisteredPanel[]): string {
  return panels
    .map((panel) => {
      const { id, idIsStable, panelConstraints } = panel;
      if (idIsStable) {
        return id;
      } else {
        return JSON.stringify(panelConstraints);
      }
    })
    .sort((a, b) => a.localeCompare(b))
    .join(",");
}
