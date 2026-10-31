import {
  createContext,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import type { Orientation, ResizePreviewMode } from "../../global/types";
import type { ParentGroup, ParentPanel } from "../../flex/types";
import type { ParentGrid } from "../../grid/types";
import type { ModelIndex } from "../models/indexModel";
import type {
  HiddenTabBehavior,
  MinimumSize,
  ParentTab,
  ParentTabset,
  TabDropTarget,
  TabNode,
  TabRenderProps,
  TabsetNode,
  WorkspaceChangeReason,
  WorkspaceClassNames,
  WorkspaceModel,
  WorkspaceStyles
} from "../types";

export type UpdateModel = (
  reason: WorkspaceChangeReason,
  isUserInteraction: boolean,
  update: (prev: WorkspaceModel) => WorkspaceModel
) => void;

export type TabHost = {
  // Not available during server rendering
  element: HTMLDivElement | null;
  panelId: string;
  tabElementId: string;
};

/**
 * Internal state shared by the parts of a Workspace.
 *
 * ℹ️ This value changes whenever the model (or drag state) changes.
 */
export type WorkspaceContextType = {
  activeTabsetId: string | undefined;
  disabled: boolean;
  dragTabId: string | undefined;
  dropTarget: TabDropTarget | undefined;
  getHiddenTabBehavior: (tab: TabNode) => HiddenTabBehavior;
  getTabHandle: (tabId: string) => ParentTab;
  getTabHost: (tabId: string) => TabHost;
  getTabsetHandle: (tabsetId: string) => ParentTabset;
  id: string;

  // True while server rendering and hydrating (when portals can't be rendered)
  isHydrating: boolean;

  minimumSizes: Map<string, MinimumSize>;
  model: WorkspaceModel;
  modelIndex: ModelIndex;

  // The Grid, Group, and Panel (if any) outside of the Workspace;
  // the Groups and Panels it renders internally are an implementation detail
  outerParents: {
    grid: ParentGrid | null;
    group: ParentGroup | null;
    panel: ParentPanel | null;
  };

  classNames: WorkspaceClassNames | undefined;
  renderEmptyTabset: ((tabset: TabsetNode) => ReactNode) | undefined;
  renderSeparator: ((orientation: Orientation) => ReactNode) | undefined;
  renderTab: ((tab: TabNode, props: TabRenderProps) => ReactNode) | undefined;
  renderTabContent: (tab: TabNode) => ReactNode;
  renderTabsetToolbar: ((tabset: TabsetNode) => ReactNode) | undefined;
  reportChromeSize: (tabsetId: string, size: MinimumSize) => void;
  reportSeparatorsSize: (splitId: string, size: number) => void;
  requestFocus: (tabId: string) => void;
  resizePreviewMode: ResizePreviewMode | undefined;
  setActiveTabsetId: (tabsetId: string) => void;
  shouldServerRenderTabContent: (tab: TabNode) => boolean;
  splitGeneration: number;
  startTabDrag: (tab: TabNode, event: ReactPointerEvent<HTMLElement>) => void;
  styles: WorkspaceStyles | undefined;
  tabPlacement: "bottom" | "left" | "right" | "top";
  takeFocusRequest: (tabId: string) => boolean;
  updateModel: UpdateModel;
};

export const WorkspaceContext = createContext<WorkspaceContextType | null>(
  null
);
