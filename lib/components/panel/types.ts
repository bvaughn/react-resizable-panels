import type { CSSProperties, PropsWithChildren, Ref } from "react";

export type PanelSize = {
  asPercentage: number;
  inPixels: number;
};

/**
 * Numeric Panel constraints are represented as numeric percentages (0..100)
 * Values specified using other CSS units must be pre-converted.
 */
export type PanelConstraints = {
  collapsedSize: number;
  collapsible: boolean;
  defaultSize: number | undefined;
  maxSize: number;
  minSize: number;
  panelId: string;
};

export type SizeUnit = "px" | "%" | "em" | "rem" | "vh" | "vw";

export type RegisteredPanel = {
  element: HTMLDivElement;
  id: string;
  idIsStable: boolean;
  onResize: OnPanelResize | undefined;
  panelConstraints: PanelConstraintProps;
};

/**
 * Imperative Panel API
 *
 * ℹ️ The `usePanelRef` and `usePanelCallbackRef` hooks are exported for convenience use in TypeScript projects.
 */
export interface PanelImperativeHandle {
  /**
   * Collapse the Panel to it's `collapsedSize`.
   *
   * ⚠️ This method will do nothing if the Panel is not `collapsible` or if it is already collapsed.
   */
  collapse: () => void;

  /**
   * Expand a collapsed Panel to its most recent size.
   *
   * ⚠️ This method will do nothing if the Panel is not currently collapsed.
   */
  expand: () => void;

  /**
   * Get the current size of the Panel in pixels as well as a percentage of the parent group (0..100).
   *
   * @return Panel size (in pixels and as a percentage of the parent group)
   */
  getSize: () => PanelSize;

  /**
   * The Panel is currently collapsed.
   */
  isCollapsed: () => boolean;

  /**
   * Update the Panel's size.
   *
   * ℹ️ Size may be specified in pixel format (number) or as a percentage (string).
   *
   * @param size New panel size
   * @return Applied size (after validation)
   */
  resize: (size: number | string) => void;
}

export type PanelProps = PropsWithChildren<{
  /**
   * CSS class name.
   *
   * ⚠️ Class is applied to nested `HTMLDivElement` to avoid styles that interfere with Flex layout.
   */
  className?: string;

  /**
   * Panel size when collapsed; defaults to 0.
   */
  collapsedSize?: number | string;

  /**
   * This panel can be collapsed.
   *
   * ℹ️ A collapsible panel will collapse when it's size is less than of the specified `minSize`
   */
  collapsible?: boolean;

  /**
   * Default size of Panel within its parent group; default is auto-assigned based on the total number of Panels.
   */
  defaultSize?: number | string;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement>;

  /**
   * Uniquely identifies this panel within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This prop is used to associate persisted group layouts with the original panel.
   *
   * ℹ️ This value will also be assigned to the `data-panel-id` attribute.
   */
  id?: string | number;

  /**
   * Maximum size of Panel within its parent group; defaults to 100%.
   */
  maxSize?: number | string;

  /**
   * Minimum size of Panel within its parent group; defaults to 0%.
   */
  minSize?: number | string;

  /**
   * Called when panel sizes change; receives a map of Panel id to size.
   */
  onResize?: (panelSize: PanelSize) => void;

  /**
   * Exposes the following imperative API:
   * - `collapse(): void`
   * - `expand(): void`
   * - `getSize(): number`
   * - `isCollapsed(): boolean`
   * - `isExpanded(): boolean`
   * - `resize(size: number): void`
   *
   * ℹ️ The `usePanelRef` and `usePanelCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  panelRef?: Ref<PanelImperativeHandle>;

  /**
   * CSS properties.
   *
   * ⚠️ Style is applied to nested `HTMLDivElement` to avoid styles that interfere with Flex layout.
   */
  style?: CSSProperties;
}>;

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
  "collapsedSize" | "collapsible" | "defaultSize" | "maxSize" | "minSize"
>;
