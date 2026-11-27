import type { GridAxis } from "../types";
import { getAxisLayoutKey } from "./getAxisLayoutKey";

/**
 * Each Grid registers a resize axis for its columns and one for its rows.
 */
export function getGridResizeAxisId(gridId: string, axis: GridAxis) {
  return `${gridId}:${getAxisLayoutKey(axis)}`;
}
