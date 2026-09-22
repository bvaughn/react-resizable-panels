import { useRef } from "react";
import type { GridImperativeHandle } from "./types";

/**
 * Convenience hook to return a properly typed ref for the Grid component.
 */
export function useGridRef() {
  return useRef<GridImperativeHandle | null>(null);
}
