import { copyModel } from "./copyModel";
import { findTab } from "./findTab";
import { findTabset } from "./findTabset";
import { getAllTabsets } from "./getAllTabsets";
import { normalizeModel } from "./normalizeModel";
import { selectTab } from "./selectTab";
import type { TabNode, WorkspaceModel } from "../types";

export function addTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tab: TabNode<TabData>,
  {
    index,
    select = true,
    tabsetId
  }: {
    index?: number | undefined;
    select?: boolean | undefined;
    tabsetId?: string | undefined;
  } = {}
): { added: boolean; model: WorkspaceModel<TabData, TabsetData> } {
  if (findTab(model, tab.id)) {
    return { added: false, model: selectTab(model, tab.id) };
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId) ?? getAllTabsets(next.root)[0];

  const position =
    index === undefined
      ? tabset.tabs.length
      : Math.max(0, Math.min(index, tabset.tabs.length));
  tabset.tabs.splice(position, 0, { ...tab });

  if (select || tabset.selectedId === undefined) {
    tabset.selectedId = tab.id;
  }

  return { added: true, model: normalizeModel(next) };
}
