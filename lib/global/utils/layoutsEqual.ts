import type { Layout } from "../../components/group/types";
import { compareLayoutNumbers } from "./compareLayoutNumbers";

export function layoutsEqual(a: Layout, b: Layout): boolean {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const id in a) {
    if (!compareLayoutNumbers(a[id], b[id])) {
      return false;
    }
  }

  return true;
}
