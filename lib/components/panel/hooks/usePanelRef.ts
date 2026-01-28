import { useRef } from "react";
import type { PanelImperativeHandle } from "../types";

/**
 * Convenience hook to return a properly typed ref for the Panel component.
 */
export function usePanelRef() {
  return useRef<PanelImperativeHandle | null>(null);
}
