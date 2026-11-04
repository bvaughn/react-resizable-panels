import {
  createContext,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import type { Orientation, ResizePreviewMode } from "../../global/types";
import type { ParentGroup, ParentPanel } from "../../flex/types";
import type { ParentGrid } from "../../grid/types";
import type { ModelIndex } from "../models/indexModel";
import type { TabListFreeSpaceStore } from "../utils/createTabListFreeSpaceStore";
import type {
  HiddenTabBehavior,
  MaximumSize,
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

  // Sizes (in pixels, along their splits) that collapsible tabsets collapse to
  collapsedSizes: { [tabsetId: string]: number };

  // Tabsets shown collapsed (or expanded) unlike the model, e.g. while a split is being resized (see isTabsetCollapsed)
  collapseOverrides: { [tabsetId: string]: boolean };
  // Tabsets shown collapsed (or expanded) as they'll be when the current resize ends (one kind of collapseOverrides)
  collapsePreview: { [tabsetId: string]: boolean };
  // Tabsets a split's Group collapsed to fit, which the model has expanded (one kind of collapseOverrides)
  collapseToFit: { [tabsetId: string]: boolean };

  disabled: boolean;
  dragTabId: string | undefined;
  dragTabsetId: string | undefined;
  dropTarget: TabDropTarget | undefined;
  getHiddenTabBehavior: (tab: TabNode) => HiddenTabBehavior;
  getTabHandle: (tabId: string) => ParentTab;
  getTabHost: (tabId: string) => TabHost;
  getTabsetHandle: (tabsetId: string) => ParentTabset;
  id: string;

  // True while server rendering and hydrating (when portals can't be rendered)
  isHydrating: boolean;

  maximumSizes: Map<string, MaximumSize>;
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
  // Previews of a split's tabsets (by id), or undefined for tabsets shown as the model has them
  reportCollapsePreview: (previews: {
    [tabsetId: string]: boolean | undefined;
  }) => void;
  reportCollapsedSize: (tabsetId: string, size: number) => void;
  // Tabsets (by id) a split's Group collapsed to fit (or undefined for tabsets shown as the model has them)
  reportCollapseToFit: (changes: {
    [tabsetId: string]: boolean | undefined;
  }) => void;
  reportSeparatorsSize: (splitId: string, size: number) => void;
  requestFocus: (tabId: string) => void;
  resizePreviewMode: ResizePreviewMode | undefined;
  setActiveTabsetId: (tabsetId: string) => void;
  shouldServerRenderTabContent: (tab: TabNode) => boolean;
  splitGeneration: number;
  startTabDrag: (tabId: string, event: ReactPointerEvent<HTMLElement>) => void;
  startTabsetDrag: (
    tabsetId: string,
    event: ReactPointerEvent<HTMLElement>
  ) => void;
  styles: WorkspaceStyles | undefined;
  tabListFreeSpaceStore: TabListFreeSpaceStore;
  tabPlacement: "bottom" | "left" | "right" | "top";
  takeFocusRequest: (tabId: string) => boolean;
  updateModel: UpdateModel;
};

export const WorkspaceContext = createContext<WorkspaceContextType | null>(
  null
);
