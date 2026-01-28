import type { Layout } from "../components/group/types";
import type { MutablePanel } from "../state/MutablePanel";

export function validateLayoutKeys(panels: MutablePanel[], layout: Layout) {
  const panelIds = panels.map((panel) => panel.id);
  const layoutKeys = Object.keys(layout);

  if (panelIds.length !== layoutKeys.length) {
    return false;
  }

  for (const panelId of panelIds) {
    if (!layoutKeys.includes(panelId)) {
      return false;
    }
  }

  return true;
}
