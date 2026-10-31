import { createContext } from "react";
import type { ParentPanel } from "../types";

export const ParentPanelContext = createContext<ParentPanel | null>(null);
