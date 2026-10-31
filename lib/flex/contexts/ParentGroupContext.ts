import { createContext } from "react";
import type { ParentGroup } from "../types";

// Unlike GroupContext, this is not reset by Grids (so content within a Cell can find the nearest Group outside of the Grid)
export const ParentGroupContext = createContext<ParentGroup | null>(null);
