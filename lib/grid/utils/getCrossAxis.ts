import type { GridAxis } from "../types";

export function getCrossAxis(axis: GridAxis): GridAxis {
  return axis === "column" ? "row" : "column";
}
