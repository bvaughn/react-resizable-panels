import type { WorkspaceModelInput } from "../types";

/**
 * The value has the structure of a model (which normalizeModel depends on).
 *
 * ℹ️ Only the structure and the fields rendered by default (e.g. tab titles) are checked; other fields (e.g. sizes) are tidied by normalizeModel.
 */
export function isValidModelInput<TabData, TabsetData>(
  value: unknown
): value is WorkspaceModelInput<TabData, TabsetData> {
  return isObject(value) && isValidNode(value.root);
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
