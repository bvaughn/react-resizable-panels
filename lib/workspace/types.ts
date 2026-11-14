import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
  RefCallback,
  RefObject
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
   *
   * ℹ️ A tabset is shown within its minimum and maximum sizes (see `minWidth` and `maxWidth`), even if its size is outside of them
   * (e.g. a model saved in a wider window); its size isn't changed, so it's shown at its size again once that fits.
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
   * Maximum width of the tabset's content area (not including its header).
   *
   * ℹ️ Interpretation rules:
   * - Strings must specify a unit: "px", "em", "rem", "vh", or "vw" (e.g. `maxWidth: "400px"`)
   * - Percentages (and strings without units) are not allowed
   * - If the tabset's minimum width is larger, the minimum is used
   *
   * ⚠️ A maximum only applies if something else can take up the rest of the space, e.g. another tabset in the same split without a maximum width;
   * otherwise it's ignored (e.g. if every tabset in a split has a maximum, or the tabset fills the workspace).
   *
   * ℹ️ Maximums don't apply to floating tabsets, which can be resized to any size larger than their minimums.
   */
  maxWidth?: string | undefined;

  /**
   * Maximum height of the tabset's content area (not including its header).
   *
   * ℹ️ Interpretation rules:
   * - Strings must specify a unit: "px", "em", "rem", "vh", or "vw" (e.g. `maxHeight: "400px"`)
   * - Percentages (and strings without units) are not allowed
   * - If the tabset's minimum height is larger, the minimum is used
   *
   * ⚠️ A maximum only applies if something else can take up the rest of the space, e.g. another tabset in the same split without a maximum height;
   * otherwise it's ignored (e.g. if every tabset in a split has a maximum, or the tabset fills the workspace).
   *
   * ℹ️ Maximums don't apply to floating tabsets, which can be resized to any size larger than their minimums.
   */
  maxHeight?: string | undefined;

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
   * The tabset can be collapsed to just its header (its tab list and toolbar), e.g. a bottom panel or a sidebar.
   *
   * ℹ️ Tabsets are collapsed by dragging a separator past their minimum size (like collapsible Panels),
   * or with the imperative API (e.g. a button rendered by `renderTabsetToolbar`, see `useParentTabset`);
   * clicking a tab (or the empty space in the header) of a collapsed tabset expands it, as does dropping tabs into it from another tabset.
   *
   * ℹ️ The only tabset in a workspace (the root) can't be collapsed, and neither can a tabset whose siblings are all collapsed.
   *
   * ℹ️ When tabsets don't fit (e.g. the workspace is made narrower than their minimum sizes), a collapsible tabset may be collapsed to fit.
   * It's shown collapsed (see `useParentTabsetState().isCollapsedToFit`), but the model isn't changed, so it's shown expanded again once it fits.
   * Until then, it can't be expanded: clicking one of its tabs selects the tab, and `expandTabset` does nothing.
   * A resize of its split doesn't change it either (it stays expanded in the model, with its size), unless the resize expands it.
   *
   * ℹ️ Tabsets created by the workspace (e.g. by dropping a tab onto the edge of another tabset) don't keep this flag.
   */
  collapsible?: boolean | undefined;

  /**
   * The tabset is collapsed to just its header.
   *
   * ℹ️ A collapsed tabset's `size` is the size it expands to; its siblings share the rest of the split.
   *
   * ℹ️ A collapsed tabset's header runs along its split (e.g. tabs placed on top are shown on the left while a tabset in a horizontal split is collapsed);
   * this doesn't change its `tabPlacement`.
   *
   * ℹ️ A floating tabset can be collapsed too (without the `collapsible` flag, which doesn't apply to it; see `FloatingTabsetNode`).
   */
  collapsed?: boolean | undefined;

  /**
   * The user cannot drag the tabset as a whole (by the empty space in its header, or by a `TabsetDragHandle`).
   *
   * ℹ️ Its tabs can still be dragged individually (unless they have their own `disableDrag` flags),
   * and the tabset can still be moved using the imperative API.
   */
  disableDrag?: boolean | undefined;

  /**
   * Id of the selected tab.
   */
  selectedId?: string | undefined;

  /**
   * Ids of the tabset's tabs that have been selected, most recently selected first;
   * used to choose which tab to select when the selected tab is removed (see the Workspace's `tabRemovalSelectionBehavior` prop).
   *
   * ℹ️ This field is maintained by the workspace, and only when `tabRemovalSelectionBehavior` is `"recent"`.
   */
  recentTabIds?: string[] | undefined;

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
 * Position and size of a floating tabset (see `WorkspaceModel.floating`), in pixels.
 *
 * ℹ️ Positions are relative to the top left corner of the workspace's layout (within the root element's padding), even in a right-to-left layout.
 */
export type FloatingTabsetRect = {
  /**
   * Distance from the left edge of the workspace's layout to the tabset's left edge.
   */
  x: number;

  /**
   * Distance from the top edge of the workspace's layout to the tabset's top edge.
   */
  y: number;

  /**
   * Width of the tabset (including its header).
   */
  width: number;

  /**
   * Height of the tabset (including its header).
   */
  height: number;
};

/**
 * A tabset that floats above the workspace's layout (see `WorkspaceModel.floating`), e.g. a notepad that can be moved out of the way of the content beneath it.
 *
 * ℹ️ Floating tabsets are positioned (and sized) in pixels, so they keep their size when the workspace is resized.
 * They're shown with their headers within the workspace's layout (so they can always be dragged back), and the rest of them is clipped to it;
 * their positions aren't changed to fit, though, so they're shown where they were again once that fits (e.g. when the workspace is made larger again).
 *
 * ℹ️ Unlike tabsets within the layout, floating tabsets can't be split or maximized, and their maximum sizes (`maxWidth` and `maxHeight`) are ignored.
 *
 * ℹ️ Floating tabsets can always be collapsed (with the imperative API, e.g. `useParentTabset().collapse()`), so they don't have the `collapsible` flag.
 * A collapsed floating tabset is only as large as its header across it (e.g. as tall as its tabs, when they're placed on top), and can only be resized along it;
 * its `width` and `height` are the size it expands to. Like tabsets in the layout, clicking a tab (or the empty space in the header) of a collapsed floating tabset expands it.
 */
export type FloatingTabsetNode<TabData = unknown, TabsetData = unknown> = Omit<
  TabsetNode<TabData, TabsetData>,
  "collapsible" | "size"
> &
  FloatingTabsetRect;

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
   * Tabsets that float above the layout, in stacking order (the last one is on top).
   *
   * ℹ️ Floating tabsets are created with the `floatTab` and `floatTabset` methods.
   * Dragging a floating tabset's header (or its `TabsetDragHandle`) moves it, its edges resize it, and pressing it brings it to the front.
   * Its tabs can be dragged into the layout (and other tabs can be dropped into it), and an emptied floating tabset is removed (unless it has the `keepWhenEmpty` flag).
   *
   * ℹ️ Tabset (and tab) ids are unique across the layout and its floating tabsets.
   */
  floating?: FloatingTabsetNode<TabData, TabsetData>[] | undefined;

  /**
   * Id of the tabset that is maximized, if any.
   *
   * ℹ️ Floating tabsets can't be maximized; they're shown above the maximized tabset, and still accept dropped tabs.
   */
  maximizedTabsetId?: string | undefined;
};

/**
 * A `WorkspaceModel` whose splits and tabsets may omit their ids; accepted by the `defaultModel` prop and the `setModel` method.
 */
export type WorkspaceModelInput<TabData = unknown, TabsetData = unknown> = Omit<
  WorkspaceModel<TabData, TabsetData>,
  "floating" | "root"
> & {
  floating?: FloatingTabsetNodeInput<TabData, TabsetData>[] | undefined;
  root: WorkspaceNodeInput<TabData, TabsetData>;
};

export type FloatingTabsetNodeInput<
  TabData = unknown,
  TabsetData = unknown
> = Omit<FloatingTabsetNode<TabData, TabsetData>, "id"> & {
  id?: string | undefined;
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
 *
 * ℹ️ Edges are sides of the screen, so in a right-to-left layout (e.g. within `dir="rtl"`), "left" is after the tabset in its split's `children`.
 */
export type TabDropRegion = "bottom" | "center" | "left" | "right" | "top";

/**
 * Edge of the workspace.
 *
 * ℹ️ Edges are sides of the screen, so in a right-to-left layout (e.g. within `dir="rtl"`), "left" is at the end of the root split's `children`.
 */
export type WorkspaceDropEdge = "bottom" | "left" | "right" | "top";

/**
 * Where a dragged tab can be dropped:
 * - At an `index` within a tabset's tab list (in the order of its `tabs`, which run from right to left in a right-to-left layout)
 * - Within a `region` of a tabset's content area; edges split the tabset, and the center adds the tab to it
 * - At an `edge` of the workspace, beside all of the other tabsets (filling the workspace's height or width)
 */
export type TabDropTarget =
  | { index: number; tabsetId: string }
  | { region: TabDropRegion; tabsetId: string }
  | { edge: WorkspaceDropEdge };

/**
 * Which change caused `onModelChanged` to be called.
 *
 * ⚠️ New reasons may be added in later versions.
 *
 * ℹ️ `"tear-off"` is only reported with the deprecated `onTearOff` prop, and will be removed along with it.
 */
export type WorkspaceChangeReason =
  | "add"
  | "close"
  | "collapse"
  | "copy"
  | "expand"
  | "float"
  | "maximize"
  | "move"
  | "raise"
  | "resize"
  | "restore"
  | "select"
  | "set-model"
  | "tear-off"
  | "transfer"
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
   * ℹ️ A resize that collapses or expands tabsets is reported as `"collapse"` or `"expand"` (as `"expand"` if it does both);
   * dropping tabs into a collapsed tabset expands it, but is reported as `"move"`.
   *
   * ℹ️ A tab (or tabset) dragged to another workspace (see the `dragGroup` prop) is reported as `"transfer"` by both workspaces:
   * the one it was dropped into (which added it) and the one it was dragged from (which removed it).
   *
   * ℹ️ A copy of a tab (or tabset) dropped while the copy modifier key was held (see the `copyTab` and `copyTabset` props) is reported as `"copy"` by the workspace it was dropped into;
   * the workspace it was dragged from (if that's another one) doesn't change.
   *
   * ℹ️ Floating tabsets (see `WorkspaceModel.floating`) are reported as `"float"` when they're created, `"move"` and `"resize"` when they're dragged by their headers and edges,
   * and `"raise"` when they're brought to the front (e.g. by pressing one that's behind another).
   *
   * ⚠️ New reasons may be added in later versions, so code that switches on this value should handle unrecognized values.
   */
  reason: WorkspaceChangeReason;

  /**
   * For a tab (or tabset) dropped in from another workspace (`"transfer"` and `"copy"` changes reported by the workspace it was dropped into),
   * the `dragSourceInfo` prop of that workspace (see `DisableDropArgs.sourceInfo`), e.g. to migrate the tab's data from an older version of the application.
   * `undefined` otherwise.
   */
  sourceInfo?: unknown;

  /**
   * For a tab (or tabset) dropped in from another workspace (`"transfer"` and `"copy"` changes reported by the workspace it was dropped into),
   * that workspace's id (see `DisableDropArgs.sourceWorkspaceId`). `undefined` otherwise.
   */
  sourceWorkspaceId?: string | undefined;
};

/**
 * A change that the user is about to make to the model, passed to the Workspace's `onBeforeModelChange` prop.
 */
export type BeforeModelChangeArgs<TabData = unknown, TabsetData = unknown> = {
  /** The model as it will be if the change is allowed */
  model: WorkspaceModel<TabData, TabsetData>;

  /** The model as it is */
  prevModel: WorkspaceModel<TabData, TabsetData>;

  /** Which change would be made (see `WorkspaceChangedMeta.reason`) */
  reason: WorkspaceChangeReason;

  /**
   * The tabs the change would remove from the workspace, e.g. the tab (or the tabs of the tabset) the user is closing;
   * empty if it doesn't remove any.
   */
  removedTabs: TabNode<TabData>[];

  /** For a tab (or tabset) dropped in from another workspace, that workspace's `dragSourceInfo` prop (see `WorkspaceChangedMeta.sourceInfo`) */
  sourceInfo?: unknown;

  /** For a tab (or tabset) dropped in from another workspace, that workspace's id (see `WorkspaceChangedMeta.sourceWorkspaceId`) */
  sourceWorkspaceId?: string | undefined;
};

/**
 * What happens to the content of tabs that aren't visible (see `ParentTabState.isVisible`), once it has been mounted (see the Workspace's `lazyTabContent` prop):
 * - `"keep-mounted"`: content stays mounted (and its effects keep running)
 * - `"activity"`: content stays mounted but is rendered within a hidden React `<Activity>` boundary, so its effects are unmounted (and it's re-rendered at a low priority);
 *   requires React 19.2 (falls back to `"keep-mounted"` otherwise)
 * - `"unmount"`: content is unmounted
 *
 * ℹ️ A tab is visible when it's selected, in a tabset that isn't collapsed or covered by a maximized tabset (floating tabsets aren't covered).
 * `"activity"` and `"unmount"` hide content when its tabset is collapsed (in the model) or covered by a maximized tabset,
 * but not while it's only shown collapsed temporarily (e.g. while dragging a separator, or when collapsed to fit).
 */
export type HiddenTabBehavior = "activity" | "keep-mounted" | "unmount";

/**
 * Which tab is selected when a tabset's selected tab is removed (closed, or dragged to another tabset):
 * - `"adjacent"`: the tab after it (or before it, if it was the last tab)
 * - `"recent"`: the tabset's most recently selected tab (falling back to `"adjacent"` if none of its other tabs has been selected)
 */
export type TabRemovalSelectionBehavior = "adjacent" | "recent";

/**
 * Arguments passed to the Workspace's `disableDrop` prop.
 *
 * While a tabset is dragged, `disableDrop` is called once for each of its tabs (with the target that tab would be dropped at),
 * and the target is rejected if any call returns `true`.
 */
export type DisableDropArgs<TabData = unknown, TabsetData = unknown> = {
  /**
   * `true` if a copy would be dropped (rather than the tab or tabset itself), since the copy modifier key is held; see the `copyTab` and `copyTabset` props.
   *
   * ℹ️ The tab (or tabset) passed is the one being dragged, since the copy is only made when it's dropped.
   */
  isCopy: boolean;

  model: WorkspaceModel<TabData, TabsetData>;

  /**
   * Where the tab (or tabset) is dragged from:
   * - `"local"`: this workspace
   * - `"external"`: another workspace with the same `dragGroup` (e.g. in another window)
   * - `"new"`: outside of any workspace, for a tab that's created when it's dropped (see the `startExternalDrag` method and the `acceptExternalDrop` prop)
   */
  source: "external" | "local" | "new";

  /**
   * The `dragSourceInfo` prop of the workspace the tab (or tabset) is dragged from (this workspace's own, for `"local"` drags);
   * `undefined` for `"new"` tabs, or if that workspace doesn't have the prop.
   *
   * ℹ️ e.g. to only accept tabs from workspaces of the same kind, or from a version of the application whose tab data this one understands:
   * `disableDrop={({ source, sourceInfo }) => source === "external" && sourceInfo?.app !== "reports"}`
   */
  sourceInfo: unknown;

  /**
   * The id of the workspace the tab (or tabset) is dragged from (see the Workspace's `id` prop); `undefined` for `"new"` tabs (and for drags from another page that uses an earlier release of this library).
   *
   * ⚠️ Ids are only unique within a copy of the application (e.g. ids from `useId` may be the same in another browser tab), so use `sourceInfo` to tell copies apart.
   */
  sourceWorkspaceId: string | undefined;

  /**
   * The tab being dropped.
   *
   * ⚠️ This is `undefined` when a tabset without tabs (one with the `keepWhenEmpty` flag) is dragged.
   */
  tab: TabNode<TabData> | undefined;

  /**
   * The tabset being dragged, when a whole tabset is dragged (rather than a single tab).
   */
  tabset: TabsetNode<TabData, TabsetData> | undefined;

  target: TabDropTarget;
};

/**
 * Where a popout window is on screen (in screen coordinates) and how big its content is (in pixels); see `usePopoutWindows`.
 */
export type PopoutWindowRect = {
  /** Height of the window's content, in pixels */
  height: number;

  /** Horizontal position of the window on the screen */
  screenX: number;

  /** Vertical position of the window on the screen */
  screenY: number;

  /** Width of the window's content, in pixels */
  width: number;
};

/**
 * A popout window opened by `usePopoutWindows`.
 */
export type PopoutWindow = {
  /**
   * The element (created by the popup's document, within its body) that the popout's content is rendered into.
   */
  container: HTMLElement;

  /**
   * Unique id of the popout (e.g. a React key).
   */
  id: string;

  /**
   * The popup window.
   */
  window: Window;
};

/**
 * A popout window's model and where it is on screen, e.g. to save the popouts and open them again later (see `usePopoutWindows`).
 */
export type PopoutWindowState<TabData = unknown, TabsetData = unknown> = {
  /** The popout's current model */
  model: WorkspaceModel<TabData, TabsetData>;

  /** Where the popout is on screen, and its size */
  rect: PopoutWindowRect;
};

/**
 * Props for the Workspace rendered into a popout window (see `PopoutWindows.render`).
 *
 * ℹ️ The popout window is closed once its workspace has no tabs left (e.g. its last tab is dragged back to the main window);
 * if the Workspace needs its own `onModelChanged` prop, call this one from it.
 */
export type PopoutWorkspaceProps<TabData = unknown, TabsetData = unknown> = {
  /** The popout's initial model */
  defaultModel: WorkspaceModel<TabData, TabsetData>;

  /** Closes the popout window once its workspace has no tabs left */
  onModelChanged: (
    model: WorkspaceModel<TabData, TabsetData>,
    meta: WorkspaceChangedMeta
  ) => void;

  /** Used to read the popout's current model (e.g. when it's closed) */
  workspaceRef: RefObject<WorkspaceImperativeHandle<
    TabData,
    TabsetData
  > | null>;
};

/**
 * Options for `usePopoutWindows`.
 */
export type UsePopoutWindowsOptions<TabData = unknown, TabsetData = unknown> = {
  /**
   * Copy the page's stylesheets into each popout window when it's opened (and stylesheets added to the page's head afterward).
   * Defaults to `true`; if `false`, none of the page's styles (including plain stylesheets) are copied.
   *
   * ℹ️ The rules of `<style>` elements are copied (including rules inserted with `CSSStyleSheet.insertRule`, e.g. by CSS-in-JS libraries)
   * as they are when the window opens; rules inserted into them later (and stylesheets edited or removed afterward) aren't.
   * Libraries that insert rules as components render (e.g. Emotion) can usually be configured to insert them into the popup's document instead.
   */
  copyStyles?: boolean | undefined;

  /**
   * Called with each popout window's model and position when the page that opened them is closed (or reloaded),
   * or the component that uses the hook unmounts, just before the popout windows are closed;
   * e.g. to save them (and open them again later with `open`).
   * It isn't called if there are no popout windows.
   */
  onCloseAll?:
    | ((state: PopoutWindowState<TabData, TabsetData>[]) => void)
    | undefined;

  /**
   * What happens to the tabs in a popout window when the user closes it:
   * - `"dock"` (the default) adds them back to the main workspace (see `workspaceRef`)
   * - `"discard"` closes them
   * - A function is called with the popout's model instead (e.g. to save its tabs)
   *
   * ℹ️ When docking, a tab is skipped (with a development warning) if the main workspace already has a tab with the same id (its data is not updated, and it isn't selected),
   * and only the selected tab of the popout's first tabset (that has one) is selected.
   *
   * ℹ️ It isn't called when the popout closes because its last tab was moved out of it, or when it's closed by `closeAll`
   * (or because the page that opened it is closed, or the component that uses this hook unmounts; see `onCloseAll`).
   */
  onClose?:
    | "discard"
    | "dock"
    | ((model: WorkspaceModel<TabData, TabsetData>) => void)
    | undefined;

  /**
   * Called when a popout window is opened, before its content is rendered, e.g. to set its title or style its container.
   */
  onOpen?: ((popout: PopoutWindow) => void) | undefined;

  /**
   * The main workspace, which tabs are added back to when a popout window is closed (see `onClose`).
   */
  workspaceRef: RefObject<WorkspaceImperativeHandle<
    TabData,
    TabsetData
  > | null>;
};

/**
 * Returned by `usePopoutWindows`.
 */
export type PopoutWindows<TabData = unknown, TabsetData = unknown> = {
  /**
   * Close every popout window (without moving their tabs back to the main workspace).
   */
  closeAll: () => void;

  /**
   * Each popout window's current model and where it is on screen, e.g. to save them (and open them again later with `open`).
   *
   * ℹ️ A popup that reports the opener's exact position as its own (e.g. in Brave) is reported where it was opened instead.
   */
  getState: () => PopoutWindowState<TabData, TabsetData>[];

  /**
   * Open a popout window showing a model (e.g. from a button that pops out a tab, or to restore a saved popout).
   *
   * ⚠️ Browsers block popup windows that aren't opened in response to user input (e.g. a click),
   * and some block all but the first one opened for each input.
   *
   * @returns `true` if the window was opened, or `false` if it was blocked (or the model has no tabs, in which case no window is opened)
   */
  open: (
    model: WorkspaceModelInput<TabData, TabsetData>,
    rect: PopoutWindowRect
  ) => boolean;

  /**
   * The open popout windows.
   */
  popouts: PopoutWindow[];

  /**
   * Render the popout windows' content (each into its window's container, with a portal); render the result alongside the main Workspace.
   *
   * @param renderWorkspace Renders a popout's Workspace; spread the given props onto it (along with the same `dragGroup` as the main Workspace, to drag tabs between windows)
   */
  render: (
    renderWorkspace: (
      props: PopoutWorkspaceProps<TabData, TabsetData>,
      popout: PopoutWindow
    ) => ReactNode
  ) => ReactNode;
};

/**
 * Arguments passed to the Workspace's `onTearOff` prop: the tab (or whole tabset) dropped outside of the window,
 * and a model for showing it in a new workspace (e.g. in a popup window).
 *
 * @deprecated Browsers don't reliably report where a drag that leaves the window ends (so a popup can't be opened where the tab was released),
 * and some block popups opened at the end of a drag. Open popout windows from a button instead (see `usePopoutWindows`).
 * This will be removed in the next major version.
 */
export type TearOffArgs<TabData = unknown, TabsetData = unknown> = (
  | {
      /**
       * The tab dropped outside of the window.
       */
      tab: TabNode<TabData>;
      type: "tab";
    }
  | {
      /**
       * The tabset dropped outside of the window.
       */
      tabset: TabsetNode<TabData, TabsetData>;
      type: "tabset";
    }
) & {
  /**
   * Height (in pixels) of the tabset the tab was dragged from (or of the dragged tabset), e.g. to size a popup window.
   */
  height: number;

  /**
   * A model containing only the torn off tab (in a new tabset) or tabset, e.g. the `defaultModel` of a workspace in a popup window.
   */
  model: WorkspaceModel<TabData, TabsetData>;

  /**
   * Horizontal position (in screen coordinates) where the pointer was released, e.g. to position a popup window.
   *
   * ℹ️ Approximate when dragging between workspaces (see the `dragGroup` prop), since some browsers report the wrong position when such drags end.
   */
  screenX: number;

  /**
   * Vertical position (in screen coordinates) where the pointer was released, e.g. to position a popup window.
   */
  screenY: number;

  /**
   * Width (in pixels) of the tabset the tab was dragged from (or of the dragged tabset), e.g. to size a popup window.
   */
  width: number;
};

/**
 * State passed to the Workspace's `renderDragPreview` and `renderTabsetDragPreview` props.
 */
export type DragPreviewState = {
  /**
   * `true` while dropping would add a copy of the tab (or tabset), rather than moving it, since the copy modifier key is held; see the `copyTab` and `copyTabset` props.
   */
  isCopy: boolean;

  /**
   * `true` while the pointer is outside of the window and releasing it would tear off the tab (or tabset);
   * only when the Workspace has an `onTearOff` prop.
   *
   * ℹ️ This is never set for mouse drags when the Workspace has a `dragGroup` prop, since the pointer can't be followed outside of the window then.
   *
   * @deprecated Along with the Workspace's `onTearOff` prop; this will be removed in the next major version.
   */
  isTearOff: boolean;
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
   * Add a tab to a tabset, or in a new tabset at any target `moveTab` accepts (e.g. in a new split below a tabset, or at an edge of the workspace).
   *
   * ℹ️ If a tab with the same id already exists, it is selected instead (and its data is not changed).
   *
   * ℹ️ A tab added in a new tabset is that tabset's selected tab (so `select` doesn't apply); like a moved tab, it's added to a floating tabset rather than splitting it.
   *
   * @param tab Tab to add
   * @param options.tabsetId Tabset to add the tab to; defaults to the active tabset
   * @param options.index Position within the tabset; defaults to the end
   * @param options.select Select the new tab; defaults to true
   * @param options.target Where to add the tab (see `TabDropTarget`); takes precedence over `tabsetId` and `index`
   * @param options.size Size of the new tabset, when `target` creates one (an edge region of a tabset, or an edge of the workspace), as its share of the split it's in.
   * Numbers are percentages (as in the model, see `TabsetNode.size`); strings may have units (e.g. `"200px"`), and are converted to percentages of the split's current size.
   * For an edge region, the new tabset takes its space from the tabset it splits (so its siblings keep their sizes); if that tabset doesn't have enough room, its siblings shrink in proportion to their sizes instead.
   * Defaults to half of the tabset it splits; at an edge of the workspace, an equal share of the root split (if it's in the same direction), or else half of the workspace.
   * Invalid sizes (e.g. `NaN` or `"abc"`) are ignored, with a warning in development.
   * @return `true` if the tab was added
   */
  addTab: (
    tab: TabNode<TabData>,
    options?: {
      index?: number | undefined;
      select?: boolean | undefined;
      size?: number | string | undefined;
      tabsetId?: string | undefined;
      target?: TabDropTarget | undefined;
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
   * Collapse a tabset to just its header.
   *
   * ℹ️ This has no effect unless the tabset has the `collapsible` flag (or is floating; see `FloatingTabsetNode`);
   * the only tabset in a workspace, and tabsets whose siblings are all collapsed, can't be collapsed.
   */
  collapseTabset: (tabsetId: string) => void;

  /**
   * Expand a collapsed tabset to its previous size.
   *
   * ℹ️ Tabsets are shown at least at their minimum sizes (if they fit), even if the model's sizes are smaller (see `TabsetNode.size`).
   *
   * ℹ️ This has no effect on a tabset that's only collapsed to fit, which is expanded once it fits (see `TabsetNode.collapsible`).
   */
  expandTabset: (tabsetId: string) => void;

  /**
   * Move a tab into a new floating tabset (see `WorkspaceModel.floating`), on top of any other floating tabsets.
   *
   * ℹ️ Parts of the position and size that aren't specified default to those of the tab's tabset, offset slightly down and to the right
   * (and moved, if needed, to fit within the workspace).
   *
   * ℹ️ This has no effect on the only tab of a floating tabset (unless the tabset has the `keepWhenEmpty` flag).
   */
  floatTab: (tabId: string, rect?: Partial<FloatingTabsetRect>) => void;

  /**
   * Move a tabset out of the layout, to float above it (see `WorkspaceModel.floating`), on top of any other floating tabsets.
   *
   * ℹ️ Parts of the position and size that aren't specified default to those of the tabset, offset slightly down and to the right
   * (and moved, if needed, to fit within the workspace).
   *
   * ℹ️ This has no effect on the root tabset (which fills the workspace) or a tabset that's already floating.
   * A maximized tabset is restored first.
   */
  floatTabset: (tabsetId: string, rect?: Partial<FloatingTabsetRect>) => void;

  /**
   * Id of the tabset the user most recently interacted with (by pointer or focus).
   */
  getActiveTabsetId: () => string | undefined;

  /**
   * Get the current model.
   */
  getModel: () => WorkspaceModel<TabData, TabsetData>;

  /**
   * Space (in pixels) in a tabset's tab list that its tabs don't use, e.g. how much a toolbar beside the tabs could grow
   * before they overflow (and how much space an overflow menu needs to free up, once it's negative).
   *
   * ℹ️ The space is measured along the tab list: its width, or its height if its tabs are placed on the left or right
   * (or the tabset is collapsed to a vertical strip).
   * If the tab list can't shrink any further (e.g. it's 0px wide, beside a toolbar that doesn't shrink), the amount the header's content
   * overflows the header is subtracted too, so it's still how much space a toolbar needs to free up.
   *
   * ℹ️ The tab list's `--tab-list-free-space` custom property has the same value (e.g. "120px").
   *
   * ℹ️ Within a tabset (e.g. its toolbar), the `useTabListFreeSpace` hook returns this value (and re-renders when it changes).
   *
   * @returns The free space, or `undefined` if the tabset isn't rendered (or hasn't been measured yet, e.g. while server rendering,
   * or right after the tabset is first rendered: it's measured after React commits, before the browser paints)
   */
  getTabListFreeSpace: (tabsetId: string) => number | undefined;

  /**
   * Ids of a tabset's tabs that are out of view (scrolled out of its tab list, which overflows), in the order they're shown;
   * e.g. to list them in an overflow menu.
   *
   * ℹ️ The same array is returned until the tabs out of view change.
   * Tabs that aren't rendered at all (e.g. hidden with `display: none`) aren't included.
   *
   * ℹ️ Within a tabset (e.g. its toolbar), the `useTabListOverflow` hook returns this value (and re-renders when it changes).
   *
   * @returns The ids of the tabs that are out of view, or `undefined` if the tabset isn't rendered (or hasn't been measured yet, e.g. while server rendering,
   * or right after the tabset is first rendered: it's measured after React commits, before the browser paints)
   */
  getTabListOverflow: (
    tabsetId: string,
    options?: TabListOverflowOptions
  ) => string[] | undefined;

  /**
   * Maximize a tabset, so that it covers the rest of the workspace.
   *
   * ℹ️ This has no effect on the only tabset in a workspace (the root), which already fills it, or on a floating tabset.
   * A maximized tabset is restored if it becomes the only one (e.g. after the other tabsets are closed).
   */
  maximizeTabset: (tabsetId: string) => void;

  /**
   * Move a tab to a position within a tabset's tab list, to a region of a tabset's content area,
   * or to an `edge` of the workspace (in a new tabset beside all of the other tabsets).
   *
   * ℹ️ The `"left"` and `"right"` regions (and edges) are sides of the screen (so they're mirrored in right-to-left layouts).
   *
   * ℹ️ Floating tabsets can't be split, so a tab moved to an edge region of one is added to it instead (like the `"center"` region).
   */
  moveTab: (tabId: string, target: TabDropTarget) => void;

  /**
   * Move a tabset beside another tabset (by dropping it onto a region at the edge of that tabset's content area),
   * or beside all of the other tabsets (at an `edge` of the workspace),
   * or move its tabs into another tabset (at an `index` within its tab list, or onto the `"center"` of its content area).
   * The `"left"` and `"right"` regions (and edges) are sides of the screen (so they're mirrored in right-to-left layouts).
   *
   * ℹ️ When its tabs are moved, the emptied tabset is removed (unless it has the `keepWhenEmpty` flag).
   *
   * ℹ️ A floating tabset moved beside another tabset (or to an edge of the workspace) is docked: it's moved into the layout, and stops floating.
   * Floating tabsets can't be split, so a tabset moved to an edge region of one has its tabs moved into it instead (like the `"center"` region).
   */
  moveTabset: (tabsetId: string, target: TabDropTarget) => void;

  /**
   * Set the sizes of a split's children (tabsets and splits) by id, e.g. to apply a saved preset without replacing the model.
   * Reported to `onModelChanged` with the `"resize"` reason.
   *
   * e.g. `resizeSplit("root", { sidebar: 30, main: 70 })` applies a 30/70 preset, and `resizeSplit("root", { sidebar: "250px" })` makes the sidebar 250 pixels wide (at the split's current size) and gives the rest to the other children.
   * The "Sizing tabsets" docs have examples.
   *
   * Numbers are percentages. Strings may have units (e.g. `"250px"`), which are converted to a percentage of the split's current size (like the `size` option of `addTab`);
   * like the model's sizes, they scale with the workspace afterwards (see `TabsetNode.size`). A size that can't be converted (e.g. the split isn't mounted) is stored as it is.
   * Children that aren't listed share what the others leave, in proportion to their current sizes.
   * Sizes are applied like the model's sizes are, e.g. limited by tabsets' minimum and maximum sizes.
   *
   * ℹ️ A collapsed tabset's size is the size it expands to; this doesn't collapse or expand tabsets (see `collapseTabset` and `expandTabset`).
   *
   * ⚠️ Splits that don't exist, ids that aren't children of the split, and invalid sizes (e.g. `NaN` or `"abc"`) are ignored, with a warning in development.
   *
   * @param splitId Id of the split (see `SplitNode.id`)
   * @param sizes Sizes of the split's children, by child id
   */
  resizeSplit: (
    splitId: string,
    sizes: { [childId: string]: number | string }
  ) => void;

  /**
   * Restore the maximized tabset (if there is one).
   */
  restoreTabset: () => void;

  /**
   * Select a tab within its tabset.
   *
   * ℹ️ Like a tab selected any other way, it's scrolled into view if its tab list overflows.
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
   * Start dragging a tab that isn't in the workspace yet, from an element outside of it (e.g. an item in a palette of widgets);
   * call it from the element's `pointerdown` handler.
   * The tab is dragged like tabs within the workspace are (with the same drop targets, drop indicator, and `disableDrop` checks, with the `"new"` source),
   * and is added where it's dropped (reported to `onModelChanged` with the `"add"` reason).
   *
   * The drag starts once the pointer has moved a few pixels, so a press that doesn't move (e.g. a click) does nothing;
   * the click that follows a drag is suppressed. Pressing Escape cancels the drag.
   *
   * ℹ️ Unlike other imperative methods, the drop is restricted by `disabled` and `disableDrop`, since the user chooses where it goes.
   *
   * ℹ️ The element must be in the same document as the workspace.
   * Like tabs, it should have `touch-action: none` (e.g. with CSS), so that touch input drags it rather than scrolling the page.
   *
   * @param event The `pointerdown` event of the pressed element
   * @return A promise that resolves when the drag ends: with where the tab was dropped, or `null` if it wasn't (e.g. the pointer isn't pressed or the press isn't the primary button, the drag was canceled, or it was released outside of the workspace)
   */
  startExternalDrag: (
    event: PointerEvent | ReactPointerEvent<Element>,
    options: ExternalDragOptions<TabData>
  ) => Promise<ExternalDragResult>;

  /**
   * Subscribe to changes to the free space in a tabset's tab list (see `getTabListFreeSpace`),
   * e.g. from a toolbar rendered outside of the Workspace.
   *
   * ℹ️ The listener is called synchronously when the tab list is measured (when it or its tabs change size, or tabs are added or removed),
   * before the browser paints; changes it makes to the DOM (e.g. with `flushSync`) are shown in the same frame.
   *
   * ℹ️ The listener is called with `undefined` when the tabset is removed (e.g. closed, or merged into another tabset).
   *
   * @returns A function that unsubscribes the listener
   */
  subscribeToTabListFreeSpace: (
    tabsetId: string,
    listener: (freeSpace: number | undefined) => void
  ) => () => void;

  /**
   * Subscribe to changes to which of a tabset's tabs are out of view (see `getTabListOverflow`),
   * e.g. from an overflow menu rendered outside of the Workspace.
   *
   * ℹ️ The listener is called synchronously when the tab list is measured (when it's scrolled, when it or its tabs change size, or when tabs are added or removed),
   * before the browser paints, except while the user scrolls the list (it's reported in the scroll event, and the browser may show the new position first).
   *
   * ℹ️ The listener is called with `undefined` when the tabset is removed (e.g. closed, or merged into another tabset).
   *
   * @returns A function that unsubscribes the listener
   */
  subscribeToTabListOverflow: (
    tabsetId: string,
    listener: (tabIds: string[] | undefined) => void,
    options?: TabListOverflowOptions
  ) => () => void;

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
   * so the corresponding Workspace prop is used; setting `maxHeight` or `maxWidth` to `undefined` removes the maximum.
   *
   * ℹ️ The position and size (`x`, `y`, `width`, and `height`) of a floating tabset can be changed too (and are ignored for other tabsets),
   * as can be its `collapsible` flag (which is ignored for floating tabsets).
   */
  updateTabset: (
    tabsetId: string,
    changes: {
      collapsible?: boolean | undefined;
      data?: TabsetData;
      disableDrag?: boolean | undefined;
      height?: number | undefined;
      keepWhenEmpty?: boolean | undefined;
      maxHeight?: string | undefined;
      maxWidth?: string | undefined;
      minHeight?: string | undefined;
      minWidth?: string | undefined;
      tabPlacement?: TabsetNode["tabPlacement"];
      width?: number | undefined;
      x?: number | undefined;
      y?: number | undefined;
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
   * Add a tab to this tabset, or (with `region`) in a new tabset beside it.
   *
   * @param options.region Where to add the tab (see `TabDropRegion`): `"center"` adds it to this tabset, and edge regions split this tabset
   * @param options.size Size of the new tabset, for edge regions (see `WorkspaceImperativeHandle.addTab`); its space comes from this tabset, by default half of it
   * @return `true` if the tab was added (see `WorkspaceImperativeHandle.addTab`)
   */
  addTab: (
    tab: TabNode<TabData>,
    options?: {
      index?: number | undefined;
      region?: TabDropRegion | undefined;
      select?: boolean | undefined;
      size?: number | string | undefined;
    }
  ) => boolean;

  /**
   * Close the tabset, along with any tabs it contains (see `WorkspaceImperativeHandle.closeTabset`).
   */
  close: () => void;

  /**
   * Collapse the tabset to just its header (see `WorkspaceImperativeHandle.collapseTabset`).
   */
  collapse: () => void;

  /**
   * Expand the tabset if it is collapsed (see `WorkspaceImperativeHandle.expandTabset`).
   */
  expand: () => void;

  /**
   * Move the tabset out of the layout, to float above it (see `WorkspaceImperativeHandle.floatTabset`).
   */
  float: (rect?: Partial<FloatingTabsetRect>) => void;

  /**
   * Id of the tabset.
   */
  id: string;

  /**
   * The tabset is currently collapsed (in the model).
   *
   * ℹ️ A tabset may be shown collapsed (or expanded) unlike the model: while a separator is being dragged (before the model changes),
   * and when it's collapsed to fit (see `TabsetNode.collapsible`); `useParentTabsetState().isCollapsed` reflects how it's shown.
   */
  isCollapsed: () => boolean;

  /**
   * The tabset currently floats above the layout (see `WorkspaceModel.floating`).
   */
  isFloating: () => boolean;

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
   * Select a tab within this tabset (e.g. from an overflow menu; see `useTabListOverflow`).
   *
   * ℹ️ This has no effect if the tab isn't in this tabset; use `WorkspaceImperativeHandle.selectTab` to select a tab in any tabset.
   */
  selectTab: (tabId: string) => void;

  /**
   * Id of the Workspace that contains the tabset.
   */
  workspaceId: string;
};

/**
 * Options for which tabs count as out of view (see `useTabListOverflow`).
 */
export type TabListOverflowOptions = {
  /**
   * Also include tabs that are only partly visible (cut off by an edge of the tab list), e.g. for an overflow menu that lists them too.
   * By default, only tabs that are entirely out of view are included.
   */
  includePartiallyVisible?: boolean | undefined;
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
   * The tabset is collapsed to just its header.
   *
   * ℹ️ While a separator is being dragged, this reflects how the tabset is shown (e.g. collapsed as soon as it reaches its collapsed size),
   * which the model (and `useParentTabset().isCollapsed()`) only reflects once the drag ends.
   *
   * ℹ️ A tabset that's collapsed to fit (see `isCollapsedToFit`) is collapsed, although the model has it expanded.
   *
   * ℹ️ A maximized tabset is shown expanded, but it's still collapsed when it is restored.
   */
  isCollapsed: boolean;

  /**
   * The tabset is collapsed only because it doesn't fit (e.g. the workspace is narrower than its tabsets' minimum sizes; see `TabsetNode.collapsible`).
   * The model has it expanded, and it's shown expanded again once it fits.
   *
   * ℹ️ It can't be expanded until then (e.g. `useParentTabset().expand()` does nothing), so a toolbar can hide (or disable) its "expand" button.
   */
  isCollapsedToFit: boolean;

  /**
   * The tabset can be collapsed (or is collapsed, and can be expanded), e.g. to show or hide a toolbar button:
   * it has the `collapsible` flag, isn't the only tabset in the workspace, and has a sibling that isn't collapsed (or it's floating; see `FloatingTabsetNode`).
   */
  isCollapsible: boolean;

  /**
   * The user cannot drag the tabset as a whole, because:
   * - It has the `disableDrag` flag, or one of its tabs does
   * - The Workspace has the `disabled` prop
   * - It's the only tabset in the workspace (see `isRoot`), and can't be dragged to another workspace (see the Workspace's `dragGroup` prop; tabsets with the `keepWhenEmpty` flag can't be)
   * - A tabset is maximized
   *
   * ℹ️ Dragging a floating tabset moves it (rather than dropping it elsewhere), so only its own `disableDrag` flag and the Workspace's `disabled` prop prevent that;
   * they also prevent it from being resized.
   */
  isDragDisabled: boolean;

  /**
   * The tabset floats above the layout (see `WorkspaceModel.floating`).
   */
  isFloating: boolean;

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
   * Move the tab into a new floating tabset (see `WorkspaceImperativeHandle.floatTab`).
   */
  float: (rect?: Partial<FloatingTabsetRect>) => void;

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
   * The tab is selected, and its tabset is neither collapsed nor covered by another, maximized tabset (floating tabsets are shown above a maximized tabset, so they're never covered).
   *
   * ℹ️ While a separator is being dragged, this reflects how the tab's tabset is shown (e.g. collapsed as soon as it reaches its collapsed size),
   * which the model only reflects once the drag ends; it also reflects tabsets that are collapsed to fit (see `TabsetNode.collapsible`).
   *
   * ⚠️ This value does not account for the Workspace itself being hidden.
   */
  isVisible: boolean;

  /**
   * Id of the tabset that currently contains the tab.
   */
  tabsetId: string;
};

/**
 * Options for the imperative `startExternalDrag` method.
 */
export type ExternalDragOptions<TabData = unknown> = {
  /**
   * Content of the element that follows the pointer while dragging.
   * Defaults to what the Workspace's `renderDragPreview` prop renders for the tab (or the tab's title).
   */
  preview?: ReactNode | undefined;

  /**
   * The tab to add where it's dropped; it's only added if the drop is accepted.
   *
   * ℹ️ Like tabs dragged in from other workspaces, it can't be dropped into a workspace that already has a node with its id.
   */
  tab: TabNode<TabData>;
};

/**
 * The result of the imperative `startExternalDrag` method: where the tab was dropped (as passed to `disableDrop`), or `null` if it wasn't.
 */
export type ExternalDragResult = { target: TabDropTarget } | null;

/**
 * Accepts drags that use the browser's drag and drop from outside of the workspace (e.g. elements with the `draggable` attribute, or files),
 * creating a tab where they're dropped (see the Workspace's `acceptExternalDrop` prop).
 */
export type AcceptExternalDrop<TabData = unknown> = {
  /**
   * Creates the tab to add, when a drag is dropped.
   * Returning `null` (or `undefined`) rejects the drop.
   *
   * ℹ️ The drag's data can be read here (e.g. with `dataTransfer.getData`), since browsers only let it be read when it's dropped.
   *
   * ℹ️ The tab can't be added to a workspace that already has a node with its id, and is checked by `disableDrop` (with the `"new"` source) before it's added.
   *
   * @param dataTransfer The drop event's `DataTransfer`
   * @param target Where the drag was dropped
   */
  createTab: (
    dataTransfer: DataTransfer,
    target: TabDropTarget
  ) => TabNode<TabData> | null | undefined;

  /**
   * Drag data types (e.g. `"application/x-my-widget"`, or `"Files"` for files) that are accepted; a drag is accepted if it has any of them.
   *
   * ℹ️ While a drag is in progress, browsers only let its types be read (not its data), so they decide where the drop indicator is shown.
   * Data types are compared case-insensitively, since browsers lowercase them.
   */
  types: string[];
};

export type WorkspaceProps<TabData = unknown, TabsetData = unknown> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue"
> & {
  /**
   * Lets the workspace accept drags that use the browser's drag and drop from outside of any workspace
   * (e.g. an element of the application with the `draggable` attribute, a file, or a link from another application),
   * showing the drop indicator while the drag is over the workspace, and creating a tab where it's dropped.
   * The new tab is reported to `onModelChanged` with the `"add"` reason.
   *
   * ℹ️ `disableDrop` can't be called until the tab is created (when the drag is dropped), so a target it rejects is shown as accepted while dragging;
   * the drop is ignored then. Drag sources within the application can use the imperative `startExternalDrag` method instead, which doesn't have this limitation.
   *
   * ℹ️ Elements within the workspace's tab content that handle the same drags themselves (by canceling the `dragover` and `drop` events) take precedence.
   *
   * ℹ️ This object is read when drag events are handled, so it doesn't need to be memoized.
   */
  acceptExternalDrop?: AcceptExternalDrop<TabData> | undefined;

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
   * - `dropIndicator`: shows where a dragged tab will be dropped within a tabset's panels, or at an edge of the workspace (`data-drop-indicator`)
   * - `dragPreview`: follows the pointer while a tab or tabset is dragged (`data-drag-preview`)
   *
   * ℹ️ Elements expose their state as data attributes (e.g. `data-tab-selected`, or `data-tabset-dragging` while a tabset is dragged), which can be used for styling.
   * Elements within a collapsed tabset have a `data-tabset-collapsed` attribute.
   * Elements within a tabset also have a `data-tab-placement` attribute (see `tabPlacement`).
   *
   * ℹ️ The drop indicator is the same element for the whole drag (rendered within the workspace's root element),
   * so it can be animated between regions and tabsets (e.g. `transition: inset 250ms`).
   * Its `data-region` attribute is the region of a tabset's panels it covers, or its `data-edge` attribute is the edge of the workspace it's at;
   * while a tab isn't over either, it has neither and isn't shown (`opacity: 0`).
   *
   * ℹ️ Like the render props, this object is part of what tabsets re-render for;
   * in large workspaces, define it outside of the component (or memoize it) rather than inline.
   */
  classNames?: WorkspaceClassNames<TabData, TabsetData> | undefined;

  /**
   * Initial layout of the workspace.
   *
   * ℹ️ Splits and tabsets may omit their ids; they're assigned ids based on their position (see `WorkspaceModelInput`).
   *
   * ℹ️ This value is only used when the Workspace mounts; use the imperative `setModel` method to replace it later.
   */
  defaultModel: WorkspaceModelInput<TabData, TabsetData>;

  /**
   * Lets tabs be copied by dragging them: a tab dropped while the copy modifier key is held (Option on macOS, Ctrl elsewhere) adds the copy this function returns,
   * leaving the dragged tab where it was. The change is reported to `onModelChanged` with the `"copy"` reason.
   *
   * Returning `null` (or `undefined`) moves the dragged tab instead. If that move isn't allowed either (the `disableDrop` prop rejects it, the ids conflict, or it isn't a valid place to move the tab), nothing happens.
   *
   * ℹ️ The copy needs an id that isn't used by any other node of the workspace (e.g. `crypto.randomUUID()`); copies with ids that are in use are rejected (and the tab is moved instead).
   *
   * ℹ️ The workspace the tab is dropped into makes the copy, so a tab dragged from another workspace (see the `dragGroup` prop) is copied by the workspace it's dropped into
   * (and is only copied if that workspace has this prop).
   *
   * @param tab The tab being dragged
   * @param target Where the copy will be dropped
   */
  copyTab?:
    | ((
        tab: TabNode<TabData>,
        target: TabDropTarget
      ) => TabNode<TabData> | null | undefined)
    | undefined;

  /**
   * Lets tabsets be copied by dragging them (by their headers), like the `copyTab` prop does for tabs: a tabset dropped while the copy modifier key is held adds the copy this function returns,
   * leaving the dragged tabset where it was. The change is reported to `onModelChanged` with the `"copy"` reason.
   *
   * The copy includes its tabs, which need ids that aren't used by any other node of the workspace too; the `copyTab` argument copies a tab:
   *
   * ```tsx
   * copyTabset={(tabset, copyTab) => ({ ...tabset, id: crypto.randomUUID(), tabs: tabset.tabs.map(copyTab) })}
   * ```
   *
   * Returning `null` (or `undefined`) moves the dragged tabset instead. If that move isn't allowed either (the `disableDrop` prop rejects it, the ids conflict, a `keepWhenEmpty` tabset is dropped into another workspace, or it isn't a valid place to move the tabset), nothing happens.
   *
   * ℹ️ The copy's selected tab is the copy of the dragged tabset's selected tab (matched by position), unless the copy selects one of its own tabs.
   *
   * ℹ️ A copy dropped into a tab list (or onto the center of another tabset) only adds its tabs; its id and data are only used where it's added as a tabset.
   *
   * @param tabset The tabset being dragged
   * @param copyTab Copies a tab with the `copyTab` prop (and the same drop target); without that prop (or if it returns `null`), the copy is a shallow copy of the tab with a new id
   * @param target Where the copy will be dropped
   */
  copyTabset?:
    | ((
        tabset: TabsetNode<TabData, TabsetData>,
        copyTab: (tab: TabNode<TabData>) => TabNode<TabData>,
        target: TabDropTarget
      ) => TabsetNode<TabData, TabsetData> | null | undefined)
    | undefined;

  /**
   * Locks the arrangement: tabs cannot be resized, dragged, dropped, or closed by the user.
   * Selecting tabs and maximizing tabsets still work.
   *
   * ℹ️ This prop overrides the `disableClose` and `disableDrag` flags of individual tabs.
   */
  disabled?: boolean | undefined;

  /**
   * Keeps drags between workspaces (see `dragGroup`) within this copy of the application:
   * tabs dragged from this workspace can't be dropped into other copies of the application (e.g. the application loaded in another browser window or tab), and tabs dragged from other copies can't be dropped into this workspace.
   * Workspaces in popout windows rendered by this copy of the application (with portals) are still part of the group.
   *
   * Defaults to `false`, so that workspaces with the same `dragGroup` in other copies of the application from the same origin can exchange tabs.
   */
  disableDragBetweenApps?: boolean | undefined;

  /**
   * Prevents tabs (and tabsets) from being dropped onto some (or all) targets.
   *
   * Functions are called when the target under the pointer changes;
   * returning `true` rejects the target.
   *
   * ℹ️ While a tabset is dragged, this function is called for each of its tabs (see `DisableDropArgs`),
   * so restrictions on where tabs can be dropped apply to dragged tabsets too.
   *
   * ℹ️ Tabs can also be dropped at the edges of the workspace (beside all of the other tabsets), within a few pixels of the edges of its layout
   * (except over tabset headers, where the tab lists are) or within its root element's padding.
   * These targets have an `edge` rather than a `tabsetId`; `disableDrop={({ target }) => "edge" in target}` turns them off.
   */
  disableDrop?:
    | boolean
    | ((args: DisableDropArgs<TabData, TabsetData>) => boolean)
    | undefined;

  /**
   * Lets tabs (and tabsets) be dragged between workspaces with the same `dragGroup`,
   * including workspaces in popout windows (opened by the application and rendered into with a portal)
   * and in other copies of the application from the same origin, e.g. the application loaded in another browser window or tab (see `disableDragBetweenApps`).
   * Dropping one into another workspace moves it there, keeping its id and data;
   * both workspaces report the change to `onModelChanged` with the `"transfer"` reason.
   *
   * Mouse drags use the browser's drag and drop when this prop is set, since pointer events can't follow the pointer into another window.
   * Touch drags still use pointer events, so they can't leave the window.
   *
   * ℹ️ Tab ids must be unique within the group; a tab can't be dropped into a workspace that already has a tab with its id (and a tabset with the `keepWhenEmpty` flag can't be dragged to another workspace).
   * A tab dragged to another workspace is rendered by that workspace, so its content is mounted again.
   *
   * ⚠️ A tab dragged to another copy of the application is sent there with the structured clone algorithm (like `postMessage`), so its data must be cloneable (e.g. no functions);
   * tabs whose data can't be cloned (and tabsets containing them) can only be dragged within their copy of the application.
   * Copies loaded at different times may be running different versions of the application, so the other copy may need to handle tab data it doesn't recognize.
   */
  dragGroup?: string | undefined;

  /**
   * Information about this workspace that's sent with the tabs (and tabsets) dragged from it (see the `dragGroup` prop),
   * so that the workspaces they're dragged into can tell where they came from (see `DisableDropArgs.sourceInfo` and `WorkspaceChangedMeta.sourceInfo`),
   * e.g. `{ app: "reports", schemaVersion: 3 }`.
   *
   * ⚠️ It's sent to other copies of the application with the structured clone algorithm (like tab data; see `dragGroup`), so it must be cloneable;
   * drags whose source info can't be cloned can only be dropped within their copy of the application.
   * It's read when a drag starts, so changes during a drag don't apply to it.
   */
  dragSourceInfo?: unknown;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement | null> | undefined;

  /**
   * What happens to the content of tabs that aren't visible, once it has been mounted (see `lazyTabContent`).
   * Can be a function to choose per tab (e.g. based on its data).
   *
   * - `"keep-mounted"`: content stays mounted (and its effects keep running)
   * - `"activity"`: content stays mounted but is rendered within a hidden React `<Activity>` boundary, so its effects are unmounted;
   *   requires React 19.2 (falls back to `"keep-mounted"` otherwise)
   * - `"unmount"`: content is unmounted
   *
   * ℹ️ A tab is visible when it's selected, in a tabset that isn't collapsed or covered by a maximized tabset (floating tabsets aren't covered);
   * so e.g. collapsing a tabset hides its selected tab's content, and maximizing one hides the others'.
   * Temporary collapsed states (e.g. while dragging a separator, or when collapsed to fit) don't hide content.
   *
   * ℹ️ Moving a tab never remounts its content (unless the move hides it and `hiddenTabBehavior` is `"unmount"`).
   *
   * ⚠️ Its React state is preserved, but its elements are moved within the document, which resets some browser state:
   * iframes are reloaded, playing media is paused, and focused elements are blurred.
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
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes (an explicit `data-testid` prop will take precedence).
   */
  id?: string | number | undefined;

  /**
   * Don't mount a tab's content until the tab is first visible (e.g. for expensive content in tabsets with many tabs, or in tabsets that start collapsed);
   * otherwise every tab's content is mounted along with the workspace.
   * Can be a function to choose per tab (e.g. based on its data), e.g. `(tab) => tab.data.isExpensive`.
   *
   * Once mounted, content that isn't visible is kept mounted, hidden in an `Activity`, or unmounted, as `hiddenTabBehavior` says.
   *
   * ℹ️ A tab is visible when it's selected, in a tabset that isn't collapsed or covered by a maximized tabset (floating tabsets aren't covered).
   *
   * @default false
   */
  lazyTabContent?: boolean | ((tab: TabNode<TabData>) => boolean) | undefined;

  /**
   * Called before a change the user makes (e.g. closing a tab, or dropping a tab that was dragged) is applied to the model;
   * return `false` to block it, which leaves the model as it is (and `onModelChanged` isn't called).
   *
   * e.g. to lock the layout while only allowing some interactions (selecting a tab in a collapsed tabset is an "expand" change, and pressing a floating tabset is a "raise" change):
   * `onBeforeModelChange={({ reason }) => !isLocked || ["select", "expand", "raise", "maximize", "restore"].includes(reason)}`
   *
   * Or to keep tabs with unsaved changes from being closed (however they're closed, e.g. with their close buttons or the Delete key):
   * `onBeforeModelChange={({ reason, removedTabs }) => reason !== "close" || !removedTabs.some((tab) => tab.data.isDirty)}`
   *
   * ℹ️ It's called synchronously; to ask the user first (e.g. "Save changes before closing?"), block the change and then make it with the imperative API (e.g. `closeTab`) if they confirm.
   *
   * ℹ️ Changes made with the imperative API (including the handles returned by hooks like `useParentTab`, e.g. from a custom close button) aren't passed to it, since the application makes those itself.
   * Neither is the removal of a tab (or tabset) that another workspace has accepted (see the `dragGroup` prop), or one that was torn off (see `onTearOff`),
   * since it has already been added elsewhere; use `disableDrop` (or the `disableDrag` flags) to keep tabs from being dragged out instead.
   * A workspace that a tab is dropped into can block the drop, in which case it stays in the workspace it was dragged from.
   *
   * ℹ️ Blocked resizes are undone (e.g. a separator dragged by the user moves back). Drops are blocked when the pointer is released,
   * so use `disableDrop` to show while dragging that a target doesn't accept drops.
   */
  onBeforeModelChange?:
    | ((args: BeforeModelChangeArgs<TabData, TabsetData>) => boolean | void)
    | undefined;

  /**
   * Called after the model has changed (e.g. a tab was moved, selected, or closed, or a tabset was resized).
   *
   * ℹ️ For changes caused by pointer events, this callback is not called until the pointer has been released.
   * This callback is recommended for saving models to storage.
   */
  onModelChanged?: (
    model: WorkspaceModel<TabData, TabsetData>,
    meta: WorkspaceChangedMeta
  ) => void;

  /**
   * Called when a tab (or a whole tabset) is dropped outside of the window, e.g. to open it in a popup window.
   * Return `true` to accept it, which removes it from this workspace (reported to `onModelChanged` with the `"tear-off"` reason);
   * otherwise nothing changes.
   *
   * Tabs and tabsets can only be torn off if they could be dragged, and tabsets with the `keepWhenEmpty` flag can't be torn off.
   * Without this prop, dropping a tab outside of the window does nothing.
   *
   * ⚠️ The Workspace can't tell whether the application showed the tab, so check whether `window.open` returned `null` (because the popup was blocked)
   * and return `false` then to keep the tab; returning `true` removes it even if nothing shows it.
   *
   * ℹ️ This is called while the release of the pointer is being handled (which browsers treat as user input), so a popup can be opened from it.
   * With the `dragGroup` prop, a tab is torn off when it's dropped outside of every window in the group; the end of those drags isn't treated as user input,
   * so browsers block popups opened then unless the drag started a few seconds earlier at most (and Safari blocks them always).
   *
   * ⚠️ Deprecated: browsers don't reliably report where a drag that leaves the window ends, and some block popups opened at the end of a drag.
   * Open popout windows from a button instead (see `usePopoutWindows`). This will be removed in the next major version.
   *
   * @deprecated Open popout windows from a button instead (see `usePopoutWindows`).
   */
  onTearOff?: ((args: TearOffArgs<TabData, TabsetData>) => boolean) | undefined;

  /**
   * Content of the element that follows the pointer while a tab is being dragged.
   * Defaults to the tab's title (or id).
   *
   * ℹ️ The element has a `data-tear-off` attribute while releasing the pointer would tear off the tab (see the deprecated `onTearOff` prop).
   */
  renderDragPreview?:
    | ((tab: TabNode<TabData>, state: DragPreviewState) => ReactNode)
    | undefined;

  /**
   * Content of the element that follows the pointer while a whole tabset is being dragged.
   * Defaults to the title (or id) of its selected tab followed by the number of other tabs being dragged (e.g. "One (+2)"), or the selected tab's `renderDragPreview` when that prop is set, or the tabset's id if it has no tabs.
   *
   * ℹ️ The element has a `data-drag-type` attribute: `"tabset"` while a tabset is dragged, and `"tab"` while a tab is.
   * It also has a `data-tear-off` attribute while releasing the pointer would tear off the tabset (see the deprecated `onTearOff` prop).
   */
  renderTabsetDragPreview?:
    | ((
        tabset: TabsetNode<TabData, TabsetData>,
        state: DragPreviewState
      ) => ReactNode)
    | undefined;

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
   *
   * ℹ️ Without separators, tabsets can still be resized by dragging their edges (like Panels in a Group without separators),
   * but separators are recommended: they can be resized with the keyboard,
   * and an edge's hit area can overlap the tabs beside it (pressing there resizes the tabset rather than dragging the tab).
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
   * ℹ️ Pointer events from interactive descendants (`button` elements, form controls such as `input` (and the `label` elements of form controls), editable content, elements with a `button` or form control role such as `role="checkbox"`, or elements with a `data-tab-ignore` attribute) are ignored,
   * so clicking a button within a tab doesn't select or drag it, and pressing within an input (e.g. one used to rename the tab) doesn't start a drag.
   * Keys pressed within any descendant (rather than the tab itself) are left to it, so they don't move focus between tabs or close the tab.
   *
   * ℹ️ When this prop is not provided, tabs show their title (or id) followed by a `TabCloseButton`.
   */
  renderTab?:
    | ((tab: TabNode<TabData>, props: TabRenderProps) => ReactNode)
    | undefined;

  /**
   * Content of a tab.
   *
   * ℹ️ Content is only re-rendered when its tab changes or this function does;
   * a function created while rendering (e.g. an inline arrow function) re-renders the content of every tab whenever the Workspace's parent re-renders,
   * so it should be memoized (e.g. with `useCallback`) when tab content is expensive to render.
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
  styles?: WorkspaceStyles<TabData, TabsetData> | undefined;

  /**
   * Where tabs are placed relative to tab content.
   *
   * Tabs placed on the left or right are stacked ("vertical"):
   * this determines how a dropped tab's position is found and which arrow keys move focus between tabs.
   *
   * ℹ️ Elements within a tabset have a `data-tab-placement` attribute, which can be used for styling (e.g. rotating tabs on the left or right).
   *
   * ℹ️ "left" and "right" are the start and end of the tabset (its header is rendered before or after its content),
   * so in a right-to-left layout (e.g. within `dir="rtl"`) tabs placed on the "left" are on the right;
   * styles for them should use logical properties (e.g. `border-inline-end` rather than `border-right`).
   *
   * ℹ️ Tabsets can override this with the `tabPlacement` field of their model node.
   *
   * @default "top"
   */
  tabPlacement?: "bottom" | "left" | "right" | "top" | undefined;

  /**
   * Which tab is selected when a tabset's selected tab is removed (closed, or dragged to another tabset):
   * - `"adjacent"`: the tab after it (or before it, if it was the last tab)
   * - `"recent"`: the tabset's most recently selected tab (like an IDE's editor groups),
   *   falling back to `"adjacent"` if none of its other tabs has been selected
   *
   * ℹ️ In `"recent"` mode, each tabset's recently selected tabs are saved in the model (see `TabsetNode.recentTabIds`),
   * so they're restored with the rest of the layout.
   *
   * @default "adjacent"
   */
  tabRemovalSelectionBehavior?: TabRemovalSelectionBehavior | undefined;

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
   * ℹ️ The `useWorkspaceRef` and `useWorkspaceCallbackRef` hooks are exported for convenience in TypeScript projects.
   */
  workspaceRef?:
    | Ref<WorkspaceImperativeHandle<TabData, TabsetData> | null>
    | undefined;
};

/**
 * An entry of the Workspace's `classNames` or `styles` props: a value, or a function that returns one, given the node the element belongs to.
 */
export type WorkspaceElementValue<Value, Args extends unknown[]> =
  | Value
  | ((...args: Args) => Value);

/**
 * CSS class names for the elements a Workspace renders (see the Workspace's `classNames` prop).
 *
 * Entries for the elements of a tabset, tab, or split can be functions of it (and its state), e.g. to style tabsets by their `data`:
 *
 * ```tsx
 * classNames={{
 *   header: (tabset) => (tabset.data?.compact ? "compact-header" : undefined),
 *   tab: (tab, { isSelected }) => (tab.data.isDirty && !isSelected ? "dirty-tab" : undefined)
 * }}
 * ```
 *
 * ℹ️ Functions are called when the element renders (which, for tabs, includes when their tabset re-renders);
 * keep them cheap, and (like the rest of this object) define them outside of the component or memoize them.
 */
export type WorkspaceClassNames<TabData = unknown, TabsetData = unknown> = {
  dragPreview?: string | undefined;
  dropIndicator?: string | undefined;
  /**
   * The element that positions each floating tabset (with a `data-floating-tabset` attribute, and a `data-tabset-collapsed` attribute while its tabset is collapsed), around the tabset itself, e.g. for a shadow.
   */
  floatingTabset?:
    | WorkspaceElementValue<
        string | undefined,
        [
          tabset: FloatingTabsetNode<TabData, TabsetData>,
          state: ParentTabsetState
        ]
      >
    | undefined;
  /**
   * Each of the handles along the edges (and at the corners) of a floating tabset that resize it,
   * with a `data-floating-resize-handle` attribute naming its edge (e.g. "bottom" or "bottom-right").
   *
   * ℹ️ The handles are positioned (and given resize cursors) by the workspace, but they're transparent.
   */
  floatingResizeHandle?:
    | WorkspaceElementValue<
        string | undefined,
        [
          tabset: FloatingTabsetNode<TabData, TabsetData>,
          state: ParentTabsetState
        ]
      >
    | undefined;
  header?: TabsetElementValue<string | undefined, TabData, TabsetData>;
  /**
   * Each split (a Group with `data-split` and `data-split-id` attributes); for example, its `gap` adds space between tabsets.
   *
   * ℹ️ Gaps count toward the split's minimum size, like its separators.
   */
  split?:
    | WorkspaceElementValue<
        string | undefined,
        [split: SplitNode<TabData, TabsetData>]
      >
    | undefined;
  tab?: TabElementValue<string | undefined, TabData>;
  tabContent?: TabElementValue<string | undefined, TabData>;
  tabList?: TabsetElementValue<string | undefined, TabData, TabsetData>;
  tabPanels?: TabsetElementValue<string | undefined, TabData, TabsetData>;
  tabset?: TabsetElementValue<string | undefined, TabData, TabsetData>;
  toolbar?: TabsetElementValue<string | undefined, TabData, TabsetData>;
};

/**
 * CSS properties for the elements a Workspace renders (see the Workspace's `classNames` prop);
 * like class names, entries for the elements of a tabset, tab, or split can be functions of it (and its state).
 *
 * ```tsx
 * styles={{
 *   tabset: (tabset) => ({ "--accent": tabset.data?.accent } as CSSProperties)
 * }}
 * ```
 */
export type WorkspaceStyles<TabData = unknown, TabsetData = unknown> = {
  dragPreview?: CSSProperties | undefined;
  dropIndicator?: CSSProperties | undefined;
  floatingTabset?:
    | WorkspaceElementValue<
        CSSProperties | undefined,
        [
          tabset: FloatingTabsetNode<TabData, TabsetData>,
          state: ParentTabsetState
        ]
      >
    | undefined;
  floatingResizeHandle?:
    | WorkspaceElementValue<
        CSSProperties | undefined,
        [
          tabset: FloatingTabsetNode<TabData, TabsetData>,
          state: ParentTabsetState
        ]
      >
    | undefined;
  header?: TabsetElementValue<CSSProperties | undefined, TabData, TabsetData>;
  split?:
    | WorkspaceElementValue<
        CSSProperties | undefined,
        [split: SplitNode<TabData, TabsetData>]
      >
    | undefined;
  tab?: TabElementValue<CSSProperties | undefined, TabData>;
  tabContent?: TabElementValue<CSSProperties | undefined, TabData>;
  tabList?: TabsetElementValue<CSSProperties | undefined, TabData, TabsetData>;
  tabPanels?: TabsetElementValue<
    CSSProperties | undefined,
    TabData,
    TabsetData
  >;
  tabset?: TabsetElementValue<CSSProperties | undefined, TabData, TabsetData>;
  toolbar?: TabsetElementValue<CSSProperties | undefined, TabData, TabsetData>;
};

type TabsetElementValue<Value, TabData, TabsetData> =
  | WorkspaceElementValue<
      Value,
      [tabset: TabsetNode<TabData, TabsetData>, state: ParentTabsetState]
    >
  | undefined;

type TabElementValue<Value, TabData> =
  | WorkspaceElementValue<Value, [tab: TabNode<TabData>, state: ParentTabState]>
  | undefined;

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

/**
 * A prop that's either a value or a function that returns one, given the state of the component (e.g. whether a tabset is collapsed).
 */
export type ValueOrFunction<Value, State> = Value | ((state: State) => Value);

/**
 * Props of the Workspace's buttons and handles (see `TabCloseButton`) whose values can depend on the component's state.
 */
export type StatefulProps<State> = {
  /**
   * Content of the element, or a function that returns it (given the component's state).
   */
  children?: ValueOrFunction<ReactNode, State>;

  /**
   * Class name of the element, or a function that returns it (given the component's state).
   */
  className?: ValueOrFunction<string | undefined, State>;

  /**
   * Inline styles of the element, or a function that returns them (given the component's state).
   */
  style?: ValueOrFunction<CSSProperties | undefined, State>;

  /**
   * Tooltip of the element, or a function that returns it (given the component's state).
   */
  title?: ValueOrFunction<string | undefined, State>;
};

type StatefulButtonProps<State> = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof StatefulProps<State>
> &
  StatefulProps<State>;

/**
 * State of a `TabCloseButton`, passed to its function props (see `StatefulProps`).
 */
export type TabCloseButtonState = {
  /**
   * The title of the tab the button closes (or its id, if it doesn't have one).
   */
  tabTitle: string;
};

export type TabCloseButtonProps = StatefulButtonProps<TabCloseButtonState>;

/**
 * State of a `TabsetDragHandle`, passed to its function props (see `StatefulProps`).
 */
export type TabsetDragHandleState = {
  /**
   * The tabset can't be dragged (see `ParentTabsetState.isDragDisabled`).
   */
  isDisabled: boolean;
};

export type TabsetDragHandleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  keyof StatefulProps<TabsetDragHandleState>
> &
  StatefulProps<TabsetDragHandleState>;

/**
 * State of a `TabsetCollapseButton`, passed to its function props (see `StatefulProps`).
 */
export type TabsetCollapseButtonState = {
  /**
   * The tabset is collapsed to just its header (see `ParentTabsetState.isCollapsed`).
   */
  isCollapsed: boolean;

  /**
   * The tabset is collapsed only because it doesn't fit, so it can't be expanded until it does (see `ParentTabsetState.isCollapsedToFit`);
   * the button is disabled (with `aria-disabled`) until then.
   */
  isCollapsedToFit: boolean;
};

export type TabsetCollapseButtonProps =
  StatefulButtonProps<TabsetCollapseButtonState>;

/**
 * State of a `TabsetMaximizeButton`, passed to its function props (see `StatefulProps`).
 */
export type TabsetMaximizeButtonState = {
  /**
   * The tabset is maximized (see `ParentTabsetState.isMaximized`).
   */
  isMaximized: boolean;
};

export type TabsetMaximizeButtonProps =
  StatefulButtonProps<TabsetMaximizeButtonState>;

/**
 * Minimum size of a node, in pixels (used internally).
 */
export type MinimumSize = { height: number; width: number };

/**
 * Maximum size of a node, in pixels; Infinity if it has no maximum (used internally).
 */
export type MaximumSize = { height: number; width: number };

/**
 * A pointer position, in client coordinates (used internally).
 */
export type DragPoint = { clientX: number; clientY: number };

/**
 * What is being dragged: a single tab, or a whole tabset (used internally).
 */
export type DragSource =
  | { tabId: string; type: "tab" }
  | { tabsetId: string; type: "tabset" };

/**
 * The tab (or whole tabset) being dragged (used internally).
 */
export type DragNode<TabData = unknown, TabsetData = unknown> =
  | { tab: TabNode<TabData>; type: "tab" }
  | { tabset: TabsetNode<TabData, TabsetData>; type: "tabset" };

/**
 * The workspace a tab (or tabset) dragged from another workspace started in (used internally; see `DisableDropArgs.sourceInfo`).
 */
export type DragOrigin = {
  sourceInfo: unknown;
  sourceWorkspaceId: string | undefined;
};
