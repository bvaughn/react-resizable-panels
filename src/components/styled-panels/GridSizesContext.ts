import { createContext } from "react";

/**
 * Current sizes (as percentages, by track index) of a Grid's columns and rows;
 * undefined unless the Grid was rendered with `showSizes`.
 */
export const GridSizesContext = createContext<
  { columns: number[]; rows: number[] } | undefined
>(undefined);
