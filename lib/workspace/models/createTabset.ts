import { createId } from "./createId";
import type { TabNode, TabsetNode } from "../types";

export function createTabset<TabData, TabsetData>(
  tabs: TabNode<TabData>[],
  size?: number | string
): TabsetNode<TabData, TabsetData> {
  return {
    id: createId(),
    selectedId: tabs[0]?.id,
    size,
    tabs,
    type: "tabset"
  };
}
