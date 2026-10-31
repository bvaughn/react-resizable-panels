import { createContext } from "react";
import type { TabsetNode } from "../types";

export type TabsetContextType = {
  setPanelsElement: (element: HTMLElement | null) => void;
  setTabsetElement: (element: HTMLElement | null) => void;
  tabset: TabsetNode;
  /** The tabset's `tabPlacement`, falling back to the Workspace's */
  tabPlacement: NonNullable<TabsetNode["tabPlacement"]>;
};

/**
 * Internal state for the tabset being rendered.
 */
export const TabsetContext = createContext<TabsetContextType | null>(null);
