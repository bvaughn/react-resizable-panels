import type { RegisteredPanel } from "../../panel/types";

export function getPanelKey(panels: RegisteredPanel[]): string {
  return panels.map((panel) => panel.id).join(",");
}
