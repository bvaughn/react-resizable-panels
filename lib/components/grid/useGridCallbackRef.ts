import { useState } from "react";
import type { GridImperativeHandle } from "./types";

/**
 * Convenience hook to return a properly typed ref callback for the Grid component.
 *
 * Use this hook when you need to share the ref with another component or hook.
 */
export function useGridCallbackRef() {
  return useState<GridImperativeHandle | null>(null);
}
