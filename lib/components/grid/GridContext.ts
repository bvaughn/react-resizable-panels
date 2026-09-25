import { createContext } from "react";
import type { GridContextType } from "./types";

export const GridContext = createContext<GridContextType | null>(null);
