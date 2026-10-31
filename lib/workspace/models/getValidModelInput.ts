import { warnOnce } from "../../shared/utils/warnOnce";
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
  if (isObject(value) && isValidNode(value.root)) {
    return value;
  }

  warnOnce("Invalid workspace model; using an empty workspace instead");

  return { root: { tabs: [], type: "tabset" }, version: 1 };
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isValidNode(node: unknown): boolean {
  if (!isObject(node) || !isOptionalString(node.id)) {
    return false;
  }

  switch (node.type) {
    case "split": {
      return (
        (node.orientation === "horizontal" ||
          node.orientation === "vertical") &&
        Array.isArray(node.children) &&
        node.children.every(isValidNode)
      );
    }
    case "tabset": {
      return (
        Array.isArray(node.tabs) &&
        node.tabs.every(
          (tab) =>
            isObject(tab) &&
            typeof tab.id === "string" &&
            // Titles are rendered (e.g. by the default tab), so other values would throw
            isOptionalString(tab.title)
        )
      );
    }
    default: {
      return false;
    }
  }
}
