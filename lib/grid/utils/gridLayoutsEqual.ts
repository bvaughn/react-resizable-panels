import { layoutsEqual } from "../../global/utils/layoutsEqual";
import type { GridLayout } from "../types";

export function gridLayoutsEqual(a: GridLayout, b: GridLayout) {
  return layoutsEqual(a.columns, b.columns) && layoutsEqual(a.rows, b.rows);
}
