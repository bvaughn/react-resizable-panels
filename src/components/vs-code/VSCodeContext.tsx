import { createContext } from "react";
import { NOOP_FUNCTION } from "../../../lib/constants";

export type Tab = "debug" | "folders" | "search";

export type VSCodeContextType = {
  activeTab: Tab;
  changeTab: (tab: Tab) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const VSCodeContext = createContext<VSCodeContextType>({
  activeTab: "folders",
  changeTab: NOOP_FUNCTION,
  sidebarCollapsed: false,
  toggleSidebar: NOOP_FUNCTION
});
