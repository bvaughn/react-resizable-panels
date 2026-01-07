import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";

/**
 * Panel group orientation loosely relates to the `aria-orientation` attribute.
 * It determines how panels are are laid out within the group group and the direction they can be resized in.
 */
export type Orientation = "horizontal" | "vertical";

/**
 * Map of Panel id to flexGrow value;
 */
export type Layout = {
  [id: string]: number;
};

export type LayoutStorage = Pick<Storage, "getItem" | "setItem">;

export type DragState = {
  state: "default" | "hover" | "dragging";
  separatorId: string | undefined;
};

export type RegisteredGroup = {
  defaultLayout: Layout | undefined;
  disableCursor: boolean;
  disabled: boolean;
  element: HTMLElement;
  id: string;
  // TODO Move to mutable state
  inMemoryLastExpandedPanelSizes: {
    [panelId: string]: number;
  };
  // TODO Move to mutable state
  inMemoryLayouts: {
    [panelIds: string]: Layout;
  };
  orientation: Orientation;
  panels: RegisteredPanel[];
  separators: RegisteredSeparator[];
};

export type GroupContextType = {
  id: string;
  orientation: Orientation;
  registerPanel: (panel: RegisteredPanel) => () => void;
  registerSeparator: (separator: RegisteredSeparator) => () => void;
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
   * ⚠️ Refer to the documentation for how to avoid layout shift when using server components.
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
   * - `setLayout(layout: Layout): void`
   *
   * ℹ️ The `useGroupRef` and `useGroupCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  groupRef?: Ref<GroupImperativeHandle | null> | undefined;

  /**
   * Uniquely identifies this group within an application.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-group` attribute.
   */
  id?: string | number | undefined;

  /**
   * Called when panel sizes change; receives a map of Panel id to size.
   */
  onLayoutChange?: (layout: Layout) => void | undefined;

  /**
   * Specifies the resizable orientation ("horizontal" or "vertical"); defaults to "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined;

  /**
   * CSS properties.
   *
   * ⚠️ The following styles cannot be overridden: `display`, `flex-direction`, `flex-wrap`, and `overflow`.
   */
  style?: CSSProperties | undefined;
};

export type OnGroupLayoutChange = GroupProps["onLayoutChange"];
