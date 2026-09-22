import { useContext } from "react";
import { assert } from "../../utils/assert";
import { GridContext } from "./GridContext";

export function useGridContext() {
  const context = useContext(GridContext);
  assert(
    context,
    "Grid Context not found; did you render a Cell or GridSeparator outside of a Grid?"
  );

  return context;
}
