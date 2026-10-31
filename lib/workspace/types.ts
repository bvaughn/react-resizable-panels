import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
  RefCallback
} from "react";
import type { Orientation, ResizePreviewMode } from "../global/types";

/**
 * A tab within a tabset.
 */
export type TabNode<TabData = unknown> = {
  /**
   * Uniquely identifies the tab within the workspace.
   *
   * ℹ️ Tab ids are chosen by the application, since they usually identify something real (e.g. a file path).
   */
  id: string;

  /**
   * Label used wherever the workspace generates text for the tab:
   * the default tab rendering, the default drag preview, and the `TabCloseButton` label.
   * Falls back to the tab's `id`.
   */
  title?: string | undefined;

  /**
   * Application data for the tab.
   *
   * ℹ️ This value should be serializable (e.g. JSON) if the workspace model will be saved.
   */
  data: TabData;

  /**
   * The user cannot close this tab.
   *
   * ℹ️ The tab can still be closed using the imperative API.
   */
  disableClose?: boolean | undefined;

  /**
   * The user cannot drag this tab.
   *
   * ℹ️ The tab can still be selected, and other tabs can still be dropped around it.
   */
  disableDrag?: boolean | undefined;
};

/**
 * A set of tabs, only one of which is shown at a time.
 */
export type TabsetNode<TabData = unknown, TabsetData = unknown> = {
  /**
   * Distinguishes tabsets from splits.
   */
  type: "tabset";

  /**
   * Uniquely identifies the tabset within the workspace.
   *
   * ℹ️ Optional in the `defaultModel` prop and the `setModel` method; tabsets without ids are assigned ids based on their position (e.g. "tabset-0-1").
   * Tabsets created by the workspace (e.g. by dropping a tab onto the edge of another tabset) are assigned generated ids.
   */
  id: string;

  /**
   * Size of the tabset within its parent split.
   *
   * ℹ️ Interpretation rules:
   * - Numbers are percentages of the parent split (e.g. `size: 25` is 25 percent)
   * - Strings may specify other units (e.g. `size: "250px"`); strings without units are percentages
   * - Siblings without a size share the remaining space evenly
   *
   * ⚠️ String sizes are only initial sizes: they're converted to percentages when the user resizes the split,
   * and (like percentages) they scale with the workspace when it's resized.
   */
  size?: number | string | undefined;

  /**
   * Minimum width of the tabset's content area (not including its header).
   * Overrides the Workspace's `tabsetMinWidth` prop.
   *
   * ℹ️ Interpretation rules:
   * - Strings must specify a unit: "px", "em", "rem", "vh", or "vw" (e.g. `minWidth: "200px"`)
   * - Percentages (and strings without units) are not allowed
   */
  minWidth?: string | undefined;

  /**
   * Minimum height of the tabset's content area (not including its header).
   * Overrides the Workspace's `tabsetMinHeight` prop.
   *
   * ℹ️ Interpretation rules:
   * - Strings must specify a unit: "px", "em", "rem", "vh", or "vw" (e.g. `minHeight: "200px"`)
   * - Percentages (and strings without units) are not allowed
   */
  minHeight?: string | undefined;

  /**
   * Where the tabset's tabs are placed relative to its content.
   * Overrides the Workspace's `tabPlacement` prop.
   *
   * ℹ️ See the Workspace's `tabPlacement` prop for how placement affects tabsets.
   *
   * ℹ️ Tabsets created by the workspace (e.g. by dropping a tab onto the edge of another tabset) use the Workspace's `tabPlacement` prop.
   */
  tabPlacement?: "bottom" | "left" | "right" | "top" | undefined;

  /**
   * The tabset isn't removed when its last tab is closed or dragged away;
   * it stays (showing the Workspace's `renderEmptyTabset` content) until it is closed (see `closeTabset`).
   *
   * ℹ️ By default, tabsets without tabs are removed (other than the root tabset of an empty workspace).
   *
   * ℹ️ Tabsets created by the workspace (e.g. by dropping a tab onto the edge of another tabset) don't keep this flag.
   */
  keepWhenEmpty?: boolean | undefined;

  /**
   * Id of the selected tab.
   */
  selectedId?: string | undefined;

  /**
   * Application data for the tabset.
   *
   * ℹ️ Tabsets created by the workspace start without data.
   */
  data?: TabsetData | undefined;

  /**
   * Tabs in the tabset, in the order they are shown.
   */
  tabs: TabNode<TabData>[];
};

/**
 * Lays out its children side by side (horizontally) or stacked (vertically), with resizable separators between them.
 */
export type SplitNode<TabData = unknown, TabsetData = unknown> = {
  /**
   * Distinguishes splits from tabsets.
   */
  type: "split";

  /**
   * Uniquely identifies the split within the workspace.
   *
   * ℹ️ Optional in the `defaultModel` prop and the `setModel` method; splits without ids are assigned ids based on their position (e.g. "split-root").
   */
  id: string;

  /**
   * Children are laid out side by side ("horizontal") or stacked ("vertical").
   */
  orientation: Orientation;

  /**
   * Size of the split within its parent split.
   *
   * ℹ️ Interpretation rules:
   * - Numbers are percentages of the parent split (e.g. `size: 25` is 25 percent)
   * - Strings may specify other units (e.g. `size: "250px"`); strings without units are percentages
   * - Siblings without a size share the remaining space evenly
   *
   * ⚠️ String sizes are only initial sizes: they're converted to percentages when the user resizes the split,
   * and (like percentages) they scale with the workspace when it's resized.
   */
  size?: number | string | undefined;

  /**
   * Tabsets and nested splits, in the order they are shown.
   */
  children: WorkspaceNode<TabData, TabsetData>[];
};

/**
 * A node in the workspace's layout tree: either a split or a tabset.
 */
export type WorkspaceNode<TabData = unknown, TabsetData = unknown> =
  | SplitNode<TabData, TabsetData>
  | TabsetNode<TabData, TabsetData>;

/**
 * Serializable description of a workspace's layout.
 */
export type WorkspaceModel<TabData = unknown, TabsetData = unknown> = {
  /**
   * Format version; allows the workspace to migrate models saved by older versions.
   */
  version: 1;

  /**
   * Root of the layout tree: a split or a tabset.
   *
   * ℹ️ An empty workspace is a tabset with no tabs.
   */
  root: WorkspaceNode<TabData, TabsetData>;

  /**
   * Id of the tabset that is maximized, if any.
   */
  maximizedTabsetId?: string | undefined;
};

/**
 * A `WorkspaceModel` whose splits and tabsets may omit their ids; accepted by the `defaultModel` prop and the `setModel` method.
 */
export type WorkspaceModelInput<TabData = unknown, TabsetData = unknown> = Omit<
  WorkspaceModel<TabData, TabsetData>,
  "root"
> & {
  root: WorkspaceNodeInput<TabData, TabsetData>;
};

export type WorkspaceNodeInput<TabData = unknown, TabsetData = unknown> =
  | SplitNodeInput<TabData, TabsetData>
  | TabsetNodeInput<TabData, TabsetData>;

export type SplitNodeInput<TabData = unknown, TabsetData = unknown> = Omit<
  SplitNode<TabData, TabsetData>,
  "children" | "id"
> & {
  children: WorkspaceNodeInput<TabData, TabsetData>[];
  id?: string | undefined;
};

export type TabsetNodeInput<TabData = unknown, TabsetData = unknown> = Omit<
  TabsetNode<TabData, TabsetData>,
  "id"
> & {
  id?: string | undefined;
};

/**
 * Edge (or center) of a tabset's content area.
 */
export type TabDropRegion = "bottom" | "center" | "left" | "right" | "top";

/**
 * Where a dragged tab can be dropped:
 * - At an `index` within a tabset's tab list
 * - Within a `region` of a tabset's content area; edges split the tabset, and the center adds the tab to it
 */
export type TabDropTarget =
  | { index: number; tabsetId: string }
  | { region: TabDropRegion; tabsetId: string };

/**
 * Which change caused `onModelChanged` to be called.
 *
 * ⚠️ New reasons may be added in later versions.
 */
export type WorkspaceChangeReason =
  | "add"
  | "close"
  | "maximize"
  | "move"
  | "resize"
  | "restore"
  | "select"
  | "set-model"
  | "update";

/**
 * Metadata describing a model change, passed as the second argument to the `onModelChanged` callback.
 */
export type WorkspaceChangedMeta = {
  /**
   * `true` when the change was caused by the user (e.g. dragging a tab or clicking a close button),
   * `false` for imperative API calls.
   */
  isUserInteraction: boolean;

  /**
   * Which change was made.
   *
   * ⚠️ New reasons may be added in later versions, so code that switches on this value should handle unrecognized values.
   */
  reason: WorkspaceChangeReason;
};

/**
 * What happens to the content of tabs that are not selected:
 * - `"keep-mounted"`: content stays mounted (and its effects keep running)
 * - `"activity"`: content stays mounted but is rendered within a hidden React `<Activity>` boundary, so its effects are unmounted;
 *   requires React 19.2 (falls back to `"keep-mounted"` otherwise)
 * - `"unmount"`: content is unmounted
 */
export type HiddenTabBehavior = "activity" | "keep-mounted" | "unmount";

export type DisableDropArgs<TabData = unknown, TabsetData = unknown> = {
  model: WorkspaceModel<TabData, TabsetData>;
  tab: TabNode<TabData>;
  target: TabDropTarget;
};

/**
 * Imperative Workspace API.
 *
 * The easiest way to interact with this API is to use the `useWorkspaceRef` and `useWorkspaceCallbackRef` hooks.
 *
 * ℹ️ These methods are not restricted by `disabled`, `disableClose`, `disableDrag`, or `disableDrop`.
 */
export interface WorkspaceImperativeHandle<
  TabData = unknown,
  TabsetData = unknown
> {
  /**
   * Add a tab to a tabset.
   *
   * ℹ️ If a tab with the same id already exists, it is selected instead (and its data is not changed).
   *
   * @param tab Tab to add
   * @param options.tabsetId Tabset to add the tab to; defaults to the active tabset
   * @param options.index Position within the tabset; defaults to the end
   * @param options.select Select the new tab; defaults to true
   * @return `true` if the tab was added
   */
  addTab: (
    tab: TabNode<TabData>,
    options?: {
      index?: number | undefined;
      select?: boolean | undefined;
      tabsetId?: string | undefined;
    }
  ) => boolean;

  /**
   * Close a tab.
   */
  closeTab: (tabId: string) => void;

  /**
   * Close a tabset, along with any tabs it contains (e.g. to remove an empty tabset with the `keepWhenEmpty` flag).
   *
   * ℹ️ Like the rest of the imperative API, this isn't restricted by tabs' `disableClose` flags.
   * If the root tabset is closed, the workspace is left with an empty root tabset.
   */
  closeTabset: (tabsetId: string) => void;

  /**
   * Id of the tabset the user most recently interacted with (by pointer or focus).
   */
  getActiveTabsetId: () => string | undefined;

  /**
   * Get the current model.
   */
  getModel: () => WorkspaceModel<TabData, TabsetData>;

  /**
   * Maximize a tabset, so that it covers the rest of the workspace.
   *
   * ℹ️ This has no effect on the only tabset in a workspace (the root), which already fills it.
   * A maximized tabset is restored if it becomes the only one (e.g. after the other tabsets are closed).
   */
  maximizeTabset: (tabsetId: string) => void;

  /**
   * Move a tab to a position within a tabset's tab list, or to a region of a tabset's content area.
   */
  moveTab: (tabId: string, target: TabDropTarget) => void;

  /**
   * Restore the maximized tabset (if there is one).
   */
  restoreTabset: () => void;

  /**
   * Select a tab within its tabset.
   */
  selectTab: (tabId: string) => void;

  /**
   * Replace the model.
   *
   * @return Applied model (after normalization)
   */
  setModel: (
    model: WorkspaceModelInput<TabData, TabsetData>
  ) => WorkspaceModel<TabData, TabsetData>;

  /**
   * Update a tab; fields that are not specified are not changed.
   *
   * ℹ️ `data` is replaced rather than merged.
   */
  updateTab: (
    tabId: string,
    changes: {
      data?: TabData;
      disableClose?: boolean | undefined;
      disableDrag?: boolean | undefined;
      title?: string | undefined;
    }
  ) => void;

  /**
   * Update a tabset; fields that are not specified are not changed.
   *
   * ℹ️ `data` is replaced rather than merged.
   *
   * ℹ️ Setting `minHeight`, `minWidth`, or `tabPlacement` to `undefined` removes the tabset's override,
   * so the corresponding Workspace prop is used.
   */
  updateTabset: (
    tabsetId: string,
    changes: {
      data?: TabsetData;
      keepWhenEmpty?: boolean | undefined;
      minHeight?: string | undefined;
      minWidth?: string | undefined;
      tabPlacement?: TabsetNode["tabPlacement"];
    }
  ) => void;
}

/**
 * The nearest ancestor Workspace (returned by `useParentWorkspace`), including its imperative API.
 */
export type ParentWorkspace<
  TabData = unknown,
  TabsetData = unknown
> = WorkspaceImperativeHandle<TabData, TabsetData> & {
  /**
   * Id of the Workspace.
   */
  id: string;
};

/**
 * The nearest ancestor tabset (returned by `useParentTabset`).
 *
 * ℹ️ This value does not change for the life of the tabset, so it is safe to use as an effect dependency.
 * Use `useParentTabsetState` for values that should trigger a re-render.
 */
export type ParentTabset<TabData = unknown> = {
  /**
   * Add a tab to this tabset.
   *
   * @return `true` if the tab was added (see `WorkspaceImperativeHandle.addTab`)
   */
  addTab: (
    tab: TabNode<TabData>,
    options?: { index?: number | undefined; select?: boolean | undefined }
  ) => boolean;

  /**
   * Close the tabset, along with any tabs it contains (see `WorkspaceImperativeHandle.closeTabset`).
   */
  close: () => void;

  /**
   * Id of the tabset.
   */
  id: string;

  /**
   * The tabset is currently maximized.
   */
  isMaximized: () => boolean;

  /**
   * Maximize the tabset.
   *
   * ℹ️ This has no effect on the only tabset in a workspace (see `ParentTabsetState.isRoot`).
   */
  maximize: () => void;

  /**
   * Restore the tabset if it is maximized.
   */
  restore: () => void;

  /**
   * Id of the Workspace that contains the tabset.
   */
  workspaceId: string;
};

/**
 * State of the nearest ancestor tabset (returned by `useParentTabsetState`).
 */
export type ParentTabsetState = {
  /**
   * The user most recently interacted with this tabset (by pointer or focus).
   */
  isActive: boolean;

  /**
   * The tabset is maximized.
   */
  isMaximized: boolean;

  /**
   * The tabset is the root of the model, so it's the only tabset in the workspace.
   *
   * ℹ️ Some controls aren't useful for the only tabset (e.g. maximizing it), so this can be used to hide them.
   */
  isRoot: boolean;

  /**
   * Id of the selected tab.
   */
  selectedTabId: string | undefined;
};

/**
 * The nearest ancestor tab (returned by `useParentTab`).
 *
 * ℹ️ This value does not change for the life of the tab, so it is safe to use as an effect dependency.
 * Use `useParentTabState` for values that should trigger a re-render.
 */
export type ParentTab = {
  /**
   * Close the tab.
   *
   * ℹ️ This method is not restricted by `disableClose` or `disabled`.
   */
  close: () => void;

  /**
   * Id of the tabset that currently contains the tab.
   */
  getTabsetId: () => string;

  /**
   * Id of the tab.
   */
  id: string;

  /**
   * The tab is selected within its tabset.
   */
  isSelected: () => boolean;

  /**
   * Select the tab.
   */
  select: () => void;

  /**
   * Id of the Workspace that contains the tab.
   */
  workspaceId: string;
};

/**
 * State of the nearest ancestor tab (returned by `useParentTabState`).
 */
export type ParentTabState = {
  /**
   * The user cannot close the tab (because of its `disableClose` flag or the Workspace's `disabled` prop).
   */
  isCloseDisabled: boolean;

  /**
   * The user cannot drag the tab (because of its `disableDrag` flag or the Workspace's `disabled` prop).
   */
  isDragDisabled: boolean;

  /**
   * The tab is selected within its tabset.
   *
   * ℹ️ This is true even if the tabset is covered by another, maximized tabset.
   */
  isSelected: boolean;

  /**
   * The tab is selected, and its tabset is not covered by another, maximized tabset.
   *
   * ⚠️ This value does not account for the Workspace itself being hidden.
   */
  isVisible: boolean;

  /**
   * Id of the tabset that currently contains the tab.
   */
  tabsetId: string;
};

export type WorkspaceProps<TabData = unknown, TabsetData = unknown> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue"
> & {
  /**
   * CSS class name.
   */
  className?: string | undefined;

  /**
   * CSS class names for the elements the workspace renders within its root element:
   * - `tabset`: root element of a tabset (`data-tabset`)
   * - `header`: contains a tabset's tab list and toolbar (`data-tabset-header`)
   * - `tabList`: contains a tabset's tabs (`data-tab-list`)
   * - `tab`: passed to `renderTab` with the rest of a tab's props (`data-tab`)
   * - `toolbar`: contains the content returned by `renderTabsetToolbar` (`data-tabset-toolbar`)
   * - `tabPanels`: contains a tabset's tab content (`data-tab-panels`)
   * - `tabContent`: the element each tab's content is rendered into (`data-tab-content`)
   * - `dropIndicator`: shows where a dragged tab will be dropped within a tabset's panels (`data-drop-indicator`)
   * - `dragPreview`: follows the pointer while a tab is dragged (`data-drag-preview`)
   *
   * ℹ️ Elements expose their state as data attributes (e.g. `data-tab-selected`), which can be used for styling.
   * Elements within a tabset also have a `data-tab-placement` attribute (see `tabPlacement`).
   *
   * ℹ️ Like the render props, this object is part of what tabsets re-render for;
   * in large workspaces, define it outside of the component (or memoize it) rather than inline.
   */
  classNames?: WorkspaceClassNames | undefined;

  /**
   * Initial layout of the workspace.
   *
   * ℹ️ Splits and tabsets may omit their ids; they're assigned ids based on their position (see `WorkspaceModelInput`).
   *
   * ℹ️ This value is only used when the Workspace mounts; use the imperative `setModel` method to replace it later.
   */
  defaultModel: WorkspaceModelInput<TabData, TabsetData>;

  /**
   * Locks the arrangement: tabs cannot be resized, dragged, dropped, or closed by the user.
   * Selecting tabs and maximizing tabsets still work.
   *
   * ℹ️ This prop overrides the `disableClose` and `disableDrag` flags of individual tabs.
   */
  disabled?: boolean | undefined;

  /**
   * Prevents tabs from being dropped onto some (or all) targets.
   *
   * Functions are called when the target under the pointer changes;
   * returning `true` rejects the target.
   */
  disableDrop?:
    | boolean
    | ((args: DisableDropArgs<TabData, TabsetData>) => boolean)
    | undefined;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement | null> | undefined;

  /**
   * What happens to the content of tabs that are not selected.
   * Can be a function to choose per tab (e.g. based on its data).
   *
   * - `"keep-mounted"`: content stays mounted (and its effects keep running)
   * - `"activity"`: content stays mounted but is rendered within a hidden React `<Activity>` boundary, so its effects are unmounted;
   *   requires React 19.2 (falls back to `"keep-mounted"` otherwise)
   * - `"unmount"`: content is unmounted
   *
   * ℹ️ Moving a tab never remounts its content.
   *
   * @default "keep-mounted"
   */
  hiddenTabBehavior?:
    | HiddenTabBehavior
    | ((tab: TabNode<TabData>) => HiddenTabBehavior)
    | undefined;

  /**
   * Uniquely identifies this workspace within an application.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes; (an explicit `data-testid` prop will take precedence).
   */
  id?: string | number | undefined;

  /**
   * Called after the model has changed (e.g. a tab was moved, selected, or closed, or a tabset was resized).
   *
   * ℹ️ For changes caused by pointer events, this method is not called until the pointer has been released.
   * This method is recommended when saving models to some storage api.
   */
  onModelChanged?: (
    model: WorkspaceModel<TabData, TabsetData>,
    meta: WorkspaceChangedMeta
  ) => void;

  /**
   * Content of the element that follows the pointer while a tab is being dragged.
   * Defaults to the tab's title (or id).
   */
  renderDragPreview?: ((tab: TabNode<TabData>) => ReactNode) | undefined;

  /**
   * Content shown in the panels of a tabset that has no tabs (e.g. "Drag a tab here"):
   * the root tabset of an empty workspace, or a tabset with the `keepWhenEmpty` flag.
   */
  renderEmptyTabset?:
    | ((tabset: TabsetNode<TabData, TabsetData>) => ReactNode)
    | undefined;

  /**
   * Separator rendered between the children of a split.
   * Should return a `Separator` (or `null` for no separator); defaults to an unstyled `Separator`.
   */
  renderSeparator?: ((orientation: Orientation) => ReactNode) | undefined;

  /**
   * Renders a tab (within its tabset's tab list).
   * Spread `props` onto the returned element:
   * they make it a tab (its role and ARIA attributes, keyboard and pointer handling, and data attributes),
   * and attach a `ref` that dragging and keyboard focus depend on.
   *
   * ```tsx
   * renderTab={(tab, props) => (
   *   <div {...props}>
   *     {tab.title}
   *     <TabCloseButton />
   *   </div>
   * )}
   * ```
   *
   * Individual props can be overridden or wrapped, e.g. to confirm before the Delete key closes a tab
   * (call `props.onKeyDown` for other keys).
   *
   * ⚠️ Merge `className` and `style` rather than replacing them (e.g. `style={{ ...props.style, padding: 4 }}`):
   * they include the `tab` entries of the `classNames` and `styles` props, and `style` includes the `touch-action` that touch dragging depends on.
   *
   * ℹ️ Pointer and keyboard events from interactive descendants (`button` elements, `role="button"`, or elements with a `data-tab-ignore` attribute) are ignored,
   * so clicking a button within a tab doesn't select or drag it.
   *
   * ℹ️ When this prop is not provided, tabs show their title (or id) followed by a `TabCloseButton`.
   */
  renderTab?:
    | ((tab: TabNode<TabData>, props: TabRenderProps) => ReactNode)
    | undefined;

  /**
   * Content of a tab.
   */
  renderTabContent: (tab: TabNode<TabData>) => ReactNode;

  /**
   * Content shown after a tabset's tab list (e.g. buttons to add a tab or maximize the tabset).
   *
   * ℹ️ The `useParentTabset` and `useParentTabsetState` hooks can be used within this content.
   */
  renderTabsetToolbar?:
    | ((tabset: TabsetNode<TabData, TabsetData>) => ReactNode)
    | undefined;

  /**
   * Controls whether pointer dragging updates sizes immediately,
   * or renders overlay separator previews until the pointer is released.
   *
   * @default "panel"
   */
  resizePreviewMode?: ResizePreviewMode | undefined;

  /**
   * Render the content of selected tabs on the server.
   * Can be a function to choose per tab (e.g. based on its data).
   *
   * Tab content is rendered through portals (so that moving a tab doesn't remount it), which React can't render on the server.
   * Content opted into server rendering is rendered inline instead, then moved into a portal once hydration has finished.
   *
   * ⚠️ That move remounts the content once (e.g. resetting its state and re-running its effects),
   * so this is best suited to content that is cheap to mount and benefits from being in the server-rendered HTML.
   *
   * ℹ️ This prop has no effect for workspaces that are not server rendered.
   *
   * @default false
   */
  serverRenderTabContent?:
    | boolean
    | ((tab: TabNode<TabData>) => boolean)
    | undefined;

  /**
   * CSS properties.
   */
  style?: CSSProperties | undefined;

  /**
   * CSS properties for the elements the workspace renders within its root element (see `classNames`).
   */
  styles?: WorkspaceStyles | undefined;

  /**
   * Where tabs are placed relative to tab content.
   *
   * Tabs placed on the left or right are stacked ("vertical"):
   * this determines how a dropped tab's position is found and which arrow keys move focus between tabs.
   *
   * ℹ️ Elements within a tabset have a `data-tab-placement` attribute, which can be used for styling (e.g. rotating tabs on the left or right).
   *
   * ℹ️ Tabsets can override this with the `tabPlacement` field of their model node.
   *
   * @default "top"
   */
  tabPlacement?: "bottom" | "left" | "right" | "top" | undefined;

  /**
   * Minimum height of each tabset's content area (not including its header).
   *
   * ℹ️ Tabsets can override this with the `minHeight` field of their model node.
   *
   * ℹ️ Interpretation rules:
   * - Strings must specify a unit: "px", "em", "rem", "vh", or "vw" (e.g. `tabsetMinHeight: "200px"`)
   * - Percentages (and strings without units) are not allowed
   */
  tabsetMinHeight?: string | undefined;

  /**
   * Minimum width of each tabset's content area (not including its header).
   *
   * ℹ️ Tabsets can override this with the `minWidth` field of their model node.
   *
   * ℹ️ Interpretation rules:
   * - Strings must specify a unit: "px", "em", "rem", "vh", or "vw" (e.g. `tabsetMinWidth: "200px"`)
   * - Percentages (and strings without units) are not allowed
   */
  tabsetMinWidth?: string | undefined;

  /**
   * Exposes the imperative API (see `WorkspaceImperativeHandle`).
   *
   * ℹ️ The `useWorkspaceRef` and `useWorkspaceCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  workspaceRef?:
    | Ref<WorkspaceImperativeHandle<TabData, TabsetData> | null>
    | undefined;
};

/**
 * CSS class names for the elements a Workspace renders (see the Workspace's `classNames` prop).
 */
export type WorkspaceClassNames = {
  dragPreview?: string | undefined;
  dropIndicator?: string | undefined;
  header?: string | undefined;
  tab?: string | undefined;
  tabContent?: string | undefined;
  tabList?: string | undefined;
  tabPanels?: string | undefined;
  tabset?: string | undefined;
  toolbar?: string | undefined;
};

/**
 * CSS properties for the elements a Workspace renders (see the Workspace's `classNames` prop).
 */
export type WorkspaceStyles = {
  [Element in keyof WorkspaceClassNames]?: CSSProperties | undefined;
};

/**
 * Props passed to the Workspace's `renderTab` prop, to be spread onto the element it returns.
 */
export type TabRenderProps = Pick<
  HTMLAttributes<HTMLElement>,
  | "aria-controls"
  | "aria-selected"
  | "className"
  | "id"
  | "onClick"
  | "onKeyDown"
  | "onPointerDown"
  | "role"
  | "style"
  | "tabIndex"
> & {
  ref: RefCallback<HTMLElement>;
  [dataAttribute: `data-${string}`]: string | boolean | undefined;
};

export type TabCloseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Minimum size of a node, in pixels (used internally).
 */
export type MinimumSize = { height: number; width: number };

/**
 * A pointer position, in client coordinates (used internally).
 */
export type DragPoint = { clientX: number; clientY: number };
