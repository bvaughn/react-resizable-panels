import { createContext } from "react";
import type { GroupContextType } from "./types";

export const GroupContext = createContext<GroupContextType | null>(null);
