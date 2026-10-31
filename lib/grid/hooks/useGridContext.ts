import { useContext } from "react";
import { assert } from "../../shared/utils/assert";
import { GridContext } from "../contexts/GridContext";

export function useGridContext() {
  const context = useContext(GridContext);
  assert(
    context,
    "Grid Context not found; did you render a Cell or Gridline outside of a Grid?"
  );

  return context;
}
