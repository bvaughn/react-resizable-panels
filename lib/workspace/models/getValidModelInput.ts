import { warnOnce } from "../../shared/utils/warnOnce";
import { isValidModelInput } from "./isValidModelInput";
import type { WorkspaceModelInput } from "../types";

/**
 * Returns the model if its structure (which normalizeModel depends on) is valid, or an empty model otherwise.
 *
 * Models are often loaded from storage, which may be corrupt (or saved by an older version);
 * falling back to an empty workspace is more useful than throwing.
 *
 * ℹ️ Only the structure and the fields rendered by default (e.g. tab titles) are checked; other fields (e.g. sizes) are tidied by normalizeModel.
 */
export function getValidModelInput<TabData, TabsetData>(
  value: WorkspaceModelInput<TabData, TabsetData>
): WorkspaceModelInput<TabData, TabsetData> {
  if (isValidModelInput(value)) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    warnOnce("Invalid workspace model; using an empty workspace instead");
  }

  return { root: { tabs: [], type: "tabset" }, version: 1 };
}
