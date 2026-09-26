import type { CSSProperties, ReactNode } from "react";
import type {
  GroupResizeBehavior,
  OnPanelResize,
  PanelConstraintProps,
  PanelSize
} from "../components/panel/types";

/**
 * Types shared by the resize machinery (layout math, pointer and keyboard interactions, cursors, etc.)
 * which is used by both the Group and Grid components.
 *
 * - A "resize axis" is a set of items that can be resized along one orientation;
 *   e.g. a Group (whose items are Panels) or one axis of a Grid (whose items are columns or rows).
 * - A "resize item" is one of those items (e.g. a Panel or a Grid track).
 * - A separator (e.g. a Separator or a Gridline) resizes the items on either side of it.
 */

/**
 * Orientation loosely relates to the `aria-orientation` attribute.
 * It determines how items are laid out and the direction they can be resized in.
 */
export type Orientation = "horizontal" | "vertical";

/**
 * Map of item (e.g. Panel) id to size (a percentage between 0..100)
 */
export type Layout = {
  [id: string]: number;
};

export type ResizePreviewMode = "panel" | "separator";

export type ResizeTargetMinimumSize = {
  coarse: number;
  fine: number;
};

/**
 * Numeric item constraints are represented as numeric percentages (0..100)
 * Values specified using other CSS units must be pre-converted.
 */
export type ResizeItemConstraints = {
  collapsedSize: number;
  collapsedThreshold?: number | undefined;
  collapsible: boolean;
  defaultSize: number | undefined;
  disabled: boolean | undefined;
  groupResizeBehavior?: GroupResizeBehavior | undefined;
  maxSize: number;
  minSize: number;
  itemId: string;
};

export type RegisteredResizeItem = {
  id: string;
  idIsStable: boolean;
  element: HTMLElement;
  mutableValues: {
    expandToSize: number | undefined;
    prevSize: PanelSize | undefined;
  };
  onResize: OnPanelResize | undefined;
  constraintProps: PanelConstraintProps;
};

export type RegisteredSeparator = {
  children?: ReactNode;
  className?: string | undefined;
  disabled?: boolean | undefined;
  disableDoubleClick?: boolean | undefined;
  element: HTMLDivElement;
  id: string;
  preview?: ReactNode;
  style?: CSSProperties | undefined;
};

export type HitRegion = {
  axis: RegisteredResizeAxis;
  axisSize: number;
  items: [item: RegisteredResizeItem, item: RegisteredResizeItem];
  rect: DOMRect;
  separator?: RegisteredSeparator | undefined;
};

/**
 * By default a resize axis is a flex container whose (direct) children are item and separator elements (e.g. a Group);
 * its size and resize targets are measured from those elements.
 *
 * Components with a different DOM structure (e.g. each axis of a Grid) can supply a layout strategy
 * to override how the axis is measured.
 * The rest of the resize machinery (layout math, pointer and keyboard interactions, cursors) is shared.
 */
export type ResizeAxisLayoutStrategy = {
  /**
   * Total size (in pixels) available to the axis's resizable items along its orientation.
   */
  calculateAvailableSize: () => number;

  /**
   * Resize targets for the axis; see `calculateHitRegions` for the default implementation.
   */
  calculateHitRegions: (options: {
    expandHitTargets: boolean;
    axis: RegisteredResizeAxis;
    includeDisabled: boolean;
  }) => HitRegion[];

  /**
   * Current size (in pixels) of the item with the specified id.
   */
  getItemSizeInPixels: (id: string) => number;

  /**
   * DOM ids controlled by a separator's primary item, when items have no DOM element of their own.
   */
  getItemAriaControls?: (id: string) => string | undefined;
};

export type RegisteredResizeAxis = Readonly<{
  disabled: boolean;
  element: HTMLElement;
  id: string;
  layoutStrategy?: ResizeAxisLayoutStrategy | undefined;
  mutableState: {
    defaultLayout: Readonly<Layout> | undefined;
    disableCursor: boolean;
    expandedItemSizes: {
      [itemId: string]: number;
    };
    layouts: {
      [itemIds: string]: Layout;
    };
  };
  orientation: Orientation;
  items: RegisteredResizeItem[];
  resizePreviewMode: ResizePreviewMode;
  resizeTargetMinimumSize: ResizeTargetMinimumSize;
  separators: RegisteredSeparator[];
}>;
