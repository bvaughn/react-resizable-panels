import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import type {
  Layout,
  Orientation,
  RegisteredResizeItem,
  RegisteredSeparator,
  ResizePreviewMode
} from "../global/types";

export type {
  Layout,
  Orientation,
  ResizePreviewMode,
  ResizeTargetMinimumSize
} from "../global/types";

export type LayoutStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Metadata describing a completed layout change, passed as the second argument to the `onLayoutChanged` callback.
 * See #716.
 */
export type LayoutChangedMeta<RequestedLayout = Layout> = {
  /**
   * `true` when the change was caused by the user directly manipulating a separator (keyboard or pointer)
   * `false` for every other source (imperative API calls, constraint recompute, default-size change, initial mount),
   * because the library cannot attribute the caller's intent there.
   */
  isUserInteraction: boolean;

  /**
   * Layout most recently requested by the user or application (e.g. pointer or keyboard input, imperative API, default layout)
   * before constraints were applied for the current size.
   *
   * This will differ from the validated layout when constraints temporarily override the requested layout,
   * e.g. a panel with a pixel-based `minSize` taking up a larger percentage of a small Group.
   * The requested layout is restored if the Group grows back to a size where it satisfies all constraints.
   *
   * ℹ️ When saving layouts to storage, prefer this value to the validated layout.
   */
  requestedLayout?: RequestedLayout | undefined;
};

export type DragState = {
  state: "default" | "hover" | "dragging";
  separatorId: string | undefined;
};

export type GroupContextType = {
  disableCursor: boolean;
  getPanelStyles: (
    groupId: string,
    panelId: string
  ) => CSSProperties | undefined;
  id: string;
  orientation: Orientation;
  registerOverlay: (props: SeparatorOverlayProps) => () => void;
  registerPanel: (panel: RegisteredResizeItem) => () => void;
  registerSeparator: (separator: RegisteredSeparator) => () => void;
  updatePanelProps: (
    id: string,
    props: { disabled: boolean | undefined }
  ) => void;
  updateSeparatorProps: (
    id: string,
    props: {
      disabled: boolean | undefined;
      disableDoubleClick: boolean | undefined;
    }
  ) => void;
};

/**
 * Imperative Group API.
 *
 * ℹ️ The `useGroupRef` and `useGroupCallbackRef` hooks are exported for convenience use in TypeScript projects.
 */
export interface GroupImperativeHandle {
  /**
   * Get the Group's current layout as a map of Panel id to percentage (0..100)
   *
   * @return Map of Panel id to percentages (specified as numbers ranging between 0..100)
   */
  getLayout: () => { [panelId: string]: number };

  /**
   * Set a new layout for the Group
   *
   * @param layout Map of Panel id to percentage (a number between 0..100)
   * @return Applied layout (after validation)
   */
  setLayout: (layout: { [panelId: string]: number }) => Layout;
}

export type GroupProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Panel and Separator components that comprise this group.
   */
  children?: ReactNode | undefined;

  /**
   * CSS class name.
   */
  className?: string | undefined;

  /**
   * Default layout for the Group.
   *
   * ℹ️ This value allows layouts to be remembered between page reloads.
   *
   * ⚠️ Slight layout shift may occur when server-rendering panels with percentage-based default sizes.
   * Refer to the documentation for suggestions on how to minimize the impact of this.
   */
  defaultLayout?: Layout | undefined;

  /**
   * This library sets custom mouse cursor styles to indicate drag state.
   * Use this prop to disable that behavior for Panels and Separators in this group.
   */
  disableCursor?: boolean | undefined;

  /**
   * Disable resize functionality.
   */
  disabled?: boolean | undefined;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement | null> | undefined;

  /**
   * Exposes the following imperative API:
   * - `getLayout(): Layout`
   * - `setLayout(layout: Layout): Layout`
   *
   * ℹ️ The `useGroupRef` and `useGroupCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  groupRef?: Ref<GroupImperativeHandle | null> | undefined;

  /**
   * Uniquely identifies this group within an application.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes; (an explicit `data-testid` prop will take precedence).
   */
  id?: string | number | undefined;

  /**
   * Called when the Group's layout is changing.
   *
   * ⚠️ For layout changes caused by pointer events, this method is called each time the pointer is moved.
   * For most cases, it is recommended to use the `onLayoutChanged` callback instead.
   */
  onLayoutChange?: (layout: Layout) => void | undefined;

  /**
   * Called after the Group's layout has been changed.
   *
   * ℹ️ For layout changes caused by pointer events, this method is not called until the pointer has been released.
   * This method is recommended when saving layouts to some storage api.
   *
   * ℹ️ The second argument contains meta information about the layout change.
   * The `isUserInteraction` attribute signals whether the resize was caused by direct user input.
   * It is true for resizes caused by pointer or keyboard input
   * and false for other triggers (e.g. imperative API calls, initial mount, etc.)
   * The `requestedLayout` attribute is the layout before constraints were applied for the current Group size;
   * prefer it when persisting layouts.
   */
  onLayoutChanged?: (layout: Layout, meta: LayoutChangedMeta) => void;

  /**
   * Controls whether pointer dragging updates `Panel` sizes immediately,
   * or renders overlay separator previews until the pointer is released.
   *
   * Defaults to `"panel"` (immediate resizing); `"separator"` defers resizing until release.
   *
   * Customize previews using the `SeparatorOverlay` component.
   *
   * @default "panel"
   */
  resizePreviewMode?: ResizePreviewMode | undefined;

  /**
   * Minimum size of the resizable hit target area (either `Separator` or `Panel` edge).
   * This threshold ensures targets are large enough to avoid mis-clicks.
   *
   * - Coarse inputs (typically a finger on a touchscreen) have reduced accuracy;
   * to ensure accessibility and ease of use, hit targets should be larger to prevent mis-clicks.
   * - Fine inputs (typically a mouse) can be smaller
   *
   * ℹ️ [Apple interface guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility) suggest `20pt` (`27px`) on desktops and `28pt` (`37px`) for touch devices.
   * In practice this seems to be much larger than many of their own applications use though.
   *
   * @default { coarse: 20, fine: 10 }
   */
  resizeTargetMinimumSize?: {
    coarse: number;
    fine: number;
  };

  /**
   * Specifies the resizable orientation ("horizontal" or "vertical"); defaults to "horizontal"
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined;

  /**
   * CSS properties.
   *
   * ⚠️ The default inline styles cannot be overridden, except for [`overflow`](https://react-resizable-panels.vercel.app/examples/overflow).
   */
  style?: CSSProperties | undefined;
};

export type OnGroupLayoutChange = GroupProps["onLayoutChange"];
export type OnGroupLayoutChanged = GroupProps["onLayoutChanged"];

/**
 * The nearest ancestor Group (returned by `useParentGroup`), including its imperative API.
 */
export type ParentGroup = GroupImperativeHandle & {
  /**
   * Id of the Group.
   */
  id: string;

  /**
   * Orientation of the Group.
   */
  orientation: Orientation;
};

export type PanelSize = {
  asPercentage: number;
  inPixels: number;
};

export type GroupResizeBehavior =
  | "preserve-relative-size"
  | "preserve-pixel-size";

export type SizeUnit = "px" | "%" | "em" | "rem" | "vh" | "vw";

/**
 * Imperative Panel API
 *
 * ℹ️ The `usePanelRef` and `usePanelCallbackRef` hooks are exported for convenience use in TypeScript projects.
 */
export interface PanelImperativeHandle {
  /**
   * Collapse the Panel to its `collapsedSize`.
   *
   * ⚠️ This method will do nothing if the Panel is not `collapsible` or if it is already collapsed.
   */
  collapse: () => void;

  /**
   * Expand a collapsed Panel to its most recent size.
   *
   * ℹ️ If restoring that size would require collapsing another Panel, the Panel expands to the largest size that fits instead (as long as that is at least its `minSize`).
   *
   * ⚠️ This method will do nothing if the Panel is not currently collapsed.
   */
  expand: () => void;

  /**
   * Get the current size of the Panel in pixels as well as a percentage of the parent group (0..100).
   *
   * @return Panel size (in pixels and as a percentage of the parent group)
   */
  getSize: () => {
    asPercentage: number;
    inPixels: number;
  };

  /**
   * The Panel is currently collapsed.
   */
  isCollapsed: () => boolean;

  /**
   * Update the Panel's size.
   *
   * Size can be in the following formats:
   * - Percentage of the parent Group (0..100)
   * - Pixels
   * - Relative font units (em, rem)
   * - Viewport relative units (vh, vw)
   *
   * ℹ️ Numeric values are assumed to be pixels.
   * Strings without explicit units are assumed to be percentages (0%..100%).
   * Percentages may also be specified as strings ending with "%" (e.g. "33%")
   * Pixels may also be specified as strings ending with the unit "px".
   * Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)
   *
   * @param size New panel size
   */
  resize: (size: number | string) => void;
}

type BasePanelAttributes = Omit<HTMLAttributes<HTMLDivElement>, "onResize">;

export type PanelProps = BasePanelAttributes & {
  /**
   * CSS class name.
   *
   * ⚠️ Class is applied to nested `HTMLDivElement` to avoid styles that interfere with Flex layout.
   */
  className?: string | undefined;

  /**
   * Panel size when collapsed; defaults to 0%.
   *
   * @default "0%"
   */
  collapsedSize?: number | string | undefined;

  /**
   * Distance a collapsible panel must be resized past its `minSize` to collapse,
   * or past its `collapsedSize` to expand.
   * Defaults to half the distance between `collapsedSize` and `minSize`.
   *
   * For example if a panel declares `collapsedSize="5%"`, `collapsedThreshold="5%"`, and `minSize="25%"`,
   * it will collapse when resized below 20% and expand when resized above 10%.
   *
   * ℹ️ Interpretation rules:
   * - Numbers are interpreted as pixels (e.g. `minSize={200}` is 200 pixels)
   * - Strings without explicit units are interpreted as percentage (e.g. `minSize="50"` is 50 percent)
   * - Use explicit units (e.g. "px", "%", "em", "rem", "vh", or "vw") to change interpretation
   */
  collapsedThreshold?: number | string | undefined;

  /**
   * This panel can be collapsed.
   *
   * ℹ️ A collapsible panel will collapse when its size is less than the specified `minSize`
   *
   * @default false
   */
  collapsible?: boolean | undefined;

  /**
   * Default size of Panel within its parent group; default is auto-assigned based on the total number of Panels.
   *
   * ℹ️ Interpretation rules:
   * - Numbers are interpreted as pixels (e.g. `defaultSize={200}` is 200 pixels)
   * - Strings without explicit units are interpreted as percentage (e.g. `defaultSize="50"` is 50 percent)
   * - Use explicit units (e.g. "px", "%", "em", "rem", "vh", or "vw") to change interpretation
   *
   * ⚠️ Percentage based sizes may cause slight layout shift when server-rendering.
   * For more information see the documentation.
   */
  defaultSize?: number | string | undefined;

  /**
   * When disabled, a panel cannot be resized either directly or indirectly (by resizing another panel).
   */
  disabled?: boolean | undefined;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement | null> | undefined;

  /**
   * How should this Panel behave if the parent Group is resized?
   * Defaults to `preserve-relative-size`.
   *
   * - `preserve-relative-size`: Retain the current relative size (as a percentage of the Group)
   * - `preserve-pixel-size`: Retain its current size (in pixels)
   *
   * ℹ️ Panel min/max size constraints may impact this behavior.
   *
   * ⚠️ A Group must contain at least one Panel with `preserve-relative-size` resize behavior.
   *
   * @default "preserve-relative-size"
   */
  groupResizeBehavior?:
    | "preserve-relative-size"
    | "preserve-pixel-size"
    | undefined;

  /**
   * Uniquely identifies this panel within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This prop is used to associate persisted group layouts with the original panel.
   *
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes; (an explicit `data-testid` prop will take precedence).
   */
  id?: string | number | undefined;

  /**
   * Maximum size of Panel within its parent group; defaults to `"100%"`.
   *
   * ℹ️ Interpretation rules:
   * - Numbers are interpreted as pixels (e.g. `maxSize={200}` is 200 pixels)
   * - Strings without explicit units are interpreted as percentage (e.g. `maxSize="50"` is 50 percent)
   * - Use explicit units (e.g. "px", "%", "em", "rem", "vh", or "vw") to change interpretation
   *
   * @default "100%"
   */
  maxSize?: number | string | undefined;

  /**
   * Minimum size of Panel within its parent group; defaults to 0%.
   *
   * ℹ️ Interpretation rules:
   * - Numbers are interpreted as pixels (e.g. `minSize={200}` is 200 pixels)
   * - Strings without explicit units are interpreted as percentage (e.g. `minSize="50"` is 50 percent)
   * - Use explicit units (e.g. "px", "%", "em", "rem", "vh", or "vw") to change interpretation
   *
   * @default "0%"
   */
  minSize?: number | string | undefined;

  /**
   * Called when panel sizes change.
   *
   * @param panelSize Panel size (both as a percentage of the parent Group and in pixels)
   * @param id Panel id (if one was provided as a prop)
   * @param prevPanelSize Previous panel size (will be undefined on mount)
   */
  onResize?:
    | ((
        panelSize: PanelSize,
        id: string | number | undefined,
        prevPanelSize: PanelSize | undefined
      ) => void)
    | undefined;

  /**
   * Exposes the following imperative API:
   * - `collapse(): void`
   * - `expand(): void`
   * - `getSize(): PanelSize`
   * - `isCollapsed(): boolean`
   * - `resize(size: number | string): void`
   *
   * ℹ️ The `usePanelRef` and `usePanelCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  panelRef?: Ref<PanelImperativeHandle | null> | undefined;

  /**
   * CSS properties.
   *
   * ⚠️ The default inline styles cannot be overridden, except for [`overflow`](https://react-resizable-panels.vercel.app/examples/overflow).
   */
  style?: CSSProperties | undefined;
};

export type OnPanelResize = PanelProps["onResize"];

/**
 * Size constraints may be specified in a variety of ways:
 * - Percentage of the parent Group (0..100)
 * - Pixels
 * - Relative font units (em, rem)
 * - Viewport relative units (vh, vw)
 *
 * Numeric values are assumed to be pixels.
 * Strings without explicit units are assumed to be percentages (0%..100%).
 *
 * Percentages may also be specified as strings ending with "%" (e.g. "33%")
 * Pixels may also be specified as strings ending with the unit "px".
 *
 * Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)
 */
export type PanelConstraintProps = Pick<
  PanelProps,
  | "collapsedSize"
  | "collapsedThreshold"
  | "collapsible"
  | "defaultSize"
  | "disabled"
  | "groupResizeBehavior"
  | "maxSize"
  | "minSize"
>;

/**
 * The nearest ancestor Panel (returned by `useParentPanel`), including its imperative API.
 */
export type ParentPanel = PanelImperativeHandle & {
  /**
   * Id of the Group that contains the Panel.
   */
  groupId: string;

  /**
   * Id of the Panel.
   */
  id: string;
};

type BaseSeparatorAttributes = Omit<
  HTMLAttributes<HTMLDivElement>,
  "role" | "tabIndex"
>;

export type SeparatorProps = BaseSeparatorAttributes & {
  /**
   * CSS class name.
   *
   * ℹ️ Use the `data-separator` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  className?: string | undefined;

  /**
   * When disabled, the separator cannot be used to resize its neighboring panels.
   *
   * ℹ️ The panels may still be resized indirectly (while other panels are being resized).
   * To prevent a panel from being resized at all, it needs to also be disabled.
   */
  disabled?: boolean | undefined;

  /**
   * When true, double-clicking this `Separator` will not reset its `Panel` to its default size.
   */
  disableDoubleClick?: boolean;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement> | undefined;

  /**
   * Uniquely identifies the separator within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `id` and `data-testid` attributes; (an explicit `data-testid` prop will take precedence).
   */
  id?: string | number | undefined;

  /**
   * Overrides the `Group` default preview for this `Separator` when `resizePreviewMode` is "separator".
   */
  preview?: ReactNode;

  /**
   * CSS properties.
   *
   * ℹ️ Use the `data-separator` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  style?: CSSProperties | undefined;
};

export type SeparatorOverlayProps = HTMLAttributes<HTMLDivElement>;
