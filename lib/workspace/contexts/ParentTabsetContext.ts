import { createContext } from "react";
import type { ParentTabset } from "../types";

export const ParentTabsetContext = createContext<ParentTabset | null>(null);
