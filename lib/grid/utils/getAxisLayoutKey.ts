import type { GridAxis } from "../types";

/**
 * Returns the key used for the specified axis in a GridLayout (e.g. `layout.columns`)
 */
export function getAxisLayoutKey(axis: GridAxis): "columns" | "rows" {
  return axis === "column" ? "columns" : "rows";
}
