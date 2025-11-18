import type { RegisteredPanel } from "../../panel/types";
import type { Layout } from "../types";
import { getPanelKey } from "./getPanelKey";
import { getSavedLayouts } from "./getSavedLayouts";

export function loadGroupLayout({
  id,
  panels,
  storage
}: {
  id: string;
  panels: RegisteredPanel[];
  storage: Storage;
}): Layout | undefined {
  const panelKey = getPanelKey(panels);
  const savedLayouts = getSavedLayouts({ id, storage });

  return savedLayouts[panelKey];
}
