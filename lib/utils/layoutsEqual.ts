import type { Layout } from "../components/group/types";
import { compareLayoutNumbers } from "./compareLayoutNumbers";

export function layoutsEqual(a: Layout, b: Layout): boolean {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const id in a) {
    // Edge case: Panel id has been changed
    if (b[id] === undefined || compareLayoutNumbers(a[id], b[id]) !== 0) {
      return false;
    }
  }

  return true;
}
