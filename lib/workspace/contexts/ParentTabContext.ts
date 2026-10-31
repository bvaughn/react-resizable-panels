import { createContext } from "react";
import type { ParentTab } from "../types";

export const ParentTabContext = createContext<ParentTab | null>(null);
