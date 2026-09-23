import { useRef } from "react";
import type { GridImperativeHandle } from "./types";

/** Convenience hook to create a typed Grid imperative ref. */
export function useGridRef() {
  return useRef<GridImperativeHandle | null>(null);
}
