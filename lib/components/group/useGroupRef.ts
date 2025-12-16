import { useRef } from "react";
import type { GroupImperativeHandle } from "./types";

/**
 * Convenience hook to return a properly typed ref for the Group component.
 */
export function useGroupRef() {
  return useRef<GroupImperativeHandle>(null);
}
