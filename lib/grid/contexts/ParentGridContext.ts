import { createContext } from "react";
import type { ParentGrid } from "../types";

export const ParentGridContext = createContext<ParentGrid | null>(null);
