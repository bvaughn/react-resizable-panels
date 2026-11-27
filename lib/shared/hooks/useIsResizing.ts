import { useContext } from "react";
import { getGridResizeAxisId } from "../../grid/utils/getGridResizeAxisId";
import { ResizeAxesContext } from "../contexts/ResizeAxesContext";
import { useIsAxisResizing } from "./useIsAxisResizing";

const NO_AXES: readonly string[] = [];

/**
 * Returns true while a Group or Grid is being resized by a pointer (e.g. by dragging a separator or gridline).
 * Layout changes made with the keyboard or the imperative API, and container size changes, are not included.
 *
 * ℹ️ Defaults to the nearest ancestor Group or Grid (whichever is closer); returns false if there isn't one.
 *
 * @param id Id of the Group or Grid to check (instead of the nearest ancestor)
 */
export function useIsResizing(id?: string): boolean {
  const nearestAxisIds = useContext(ResizeAxesContext);

  // An id may belong to either a Group (one axis) or a Grid (an axis for its columns and one for its rows)
  const axisIds =
    id !== undefined
      ? [id, getGridResizeAxisId(id, "column"), getGridResizeAxisId(id, "row")]
      : (nearestAxisIds ?? NO_AXES);

  return useIsAxisResizing(axisIds);
}
