import { createContext } from "react";
import type { TabsetNode } from "../types";

export type TabsetContextType = {
  /** The tabset is shown collapsed (a maximized tabset is shown expanded, even if it's collapsed) */
  isCollapsed: boolean;
  setHeaderElement: (element: HTMLElement | null) => void;
  setPanelsElement: (element: HTMLElement | null) => void;
  setTabsetElement: (element: HTMLElement | null) => void;
  tabset: TabsetNode;
  /** The tabset's `tabPlacement`, falling back to the Workspace's (while collapsed, its header runs along its split) */
  tabPlacement: NonNullable<TabsetNode["tabPlacement"]>;
};

/**
 * Internal state for the tabset being rendered.
 */
export const TabsetContext = createContext<TabsetContextType | null>(null);
