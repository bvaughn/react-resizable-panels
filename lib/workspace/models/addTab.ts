import { warnOnce } from "../../shared/utils/warnOnce";
import { copyModel } from "./copyModel";
import { createTabset } from "./createTabset";
import { findTab } from "./findTab";
import { findTabset } from "./findTabset";
import { getAllTabsets } from "./getAllTabsets";
import { insertAtDropTarget } from "./insertAtDropTarget";
import { insertAtWorkspaceEdge } from "./insertAtWorkspaceEdge";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import { resizeInsertedTabset } from "./resizeInsertedTabset";
import { selectTab } from "./selectTab";
import { toFloatingDropTarget } from "./toFloatingDropTarget";
import type { TabDropTarget, TabNode, WorkspaceModel } from "../types";

export function addTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tab: TabNode<TabData>,
  {
    index,
    select = true,
    size,
    tabsetId,
    target
  }: {
    index?: number | undefined;
    select?: boolean | undefined;
    // The new tabset's share of its split, when the target creates one (see WorkspaceImperativeHandle.addTab)
    size?: number | string | undefined;
    tabsetId?: string | undefined;
    target?: TabDropTarget | undefined;
  } = {}
): { added: boolean; model: WorkspaceModel<TabData, TabsetData> } {
  if (findTab(model, tab.id)) {
    return { added: false, model: selectTab(model, tab.id) };
  }

  const next = copyModel(model);

  if (target !== undefined) {
    if ("edge" in target) {
      const inserted = createTabset<TabData, TabsetData>([{ ...tab }]);

      return {
        added: true,
        model: resizeInsertedTabset(
          insertAtWorkspaceEdge(next, inserted, target.edge),
          inserted.id,
          size
        )
      };
    }

    const destination = findTabset(next, target.tabsetId);
    if (destination) {
      // Floating tabsets can't be split
      const tabsetTarget = toFloatingDropTarget(next, destination, target);

      if ("index" in tabsetTarget) {
        index = tabsetTarget.index;
      } else if (tabsetTarget.region !== "center") {
        const inserted = createTabset<TabData, TabsetData>([{ ...tab }]);

        return {
          added: true,
          model: resizeInsertedTabset(
            insertAtDropTarget(next, destination, inserted, tabsetTarget),
            inserted.id,
            size,
            destination.id
          )
        };
      }
    }

    // Other targets add the tab to an existing tabset, like the tabsetId and index options
    // (a tabset that isn't found falls back to the first tabset, below)
    tabsetId = target.tabsetId;
  }

  let tabset = findTabset(next, tabsetId);
  if (!tabset) {
    if (tabsetId !== undefined) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce(
          `Tabset "${tabsetId}" not found in workspace model; adding tab to the first tabset instead`
        );
      }
    }

    tabset = getAllTabsets(next.root)[0];
  }

  const position =
    index === undefined
      ? tabset.tabs.length
      : Math.max(0, Math.min(index, tabset.tabs.length));
  tabset.tabs.splice(position, 0, { ...tab });

  if (select || tabset.selectedId === undefined) {
    tabset.selectedId = tab.id;
  }

  return { added: true, model: normalizeCopiedModel(next) };
}
