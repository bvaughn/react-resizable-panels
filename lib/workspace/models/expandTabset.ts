import { copyModel } from "./copyModel";
import { expandCopiedTabset } from "./expandCopiedTabset";
import { findTabset } from "./findTabset";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type { WorkspaceModel } from "../types";

export function expandTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  if (!findTabset(model, tabsetId)?.collapsed) {
    return model;
  }

  const next = copyModel(model);
  expandCopiedTabset(next, tabsetId);

  return normalizeCopiedModel(next);
}
