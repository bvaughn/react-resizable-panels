import type { PanelConstraints } from "../../components/panel/types";
import { objectsEqual } from "./objectsEqual";

export function panelConstraintsEqual(
  a: PanelConstraints[],
  b: PanelConstraints[]
) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((current, index) => objectsEqual(current, b[index]));
}
