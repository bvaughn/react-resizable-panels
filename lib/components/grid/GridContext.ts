import { createContext, useContext } from "react";
import type { PanelConstraints } from "../panel/types";
import type { GridAxis, GridLayout, RegisteredCell } from "./types";

export type GridContextValue = {
  id: string;
  cells: RegisteredCell[];
  layout: GridLayout;
  constraints: { rows: PanelConstraints[]; columns: PanelConstraints[] };
  disabled: boolean;
  disableCursor: boolean;
  active: string[];
  registerCell: (cell: RegisteredCell) => () => void;
  registerSeparator: (key: string) => () => void;
  resize: (axis: GridAxis, after: number, delta: number) => void;
  reset: (axis: GridAxis, after: number) => void;
};
export const GridContext = createContext<GridContextValue | null>(null);
export function useGridContext() {
  const context = useContext(GridContext);
  if (!context) throw Error("Grid components must be rendered inside a Grid");
  return context;
}
