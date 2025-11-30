import type { CSSProperties, ReactNode, Ref } from "react";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";

/**
 * Panel group direction corresponds to the `flex-direction` CSS property.
 * It determines how panels are are placed in the group group and the direction they can be resized in.
 * Horizontal corresponds to flex "row" and vertical to "column".
 */
export type Direction = "horizontal" | "vertical";

/**
 * Map of Panel id to flexGrow value;
 */
export type Layout = {
  [id: string]: number;
};

export type DragState = {
  state: "default" | "hover" | "dragging";
  separatorId: string | undefined;
};

export type RegisteredGroup = {
  defaultLayout: Layout | undefined;
  direction: Direction;
  disableCursor: boolean;
  disabled: boolean;
  element: HTMLElement;
  id: string;
  inMemoryLayouts: {
    [panelIds: string]: Layout;
  };
  panels: RegisteredPanel[];
  separators: RegisteredSeparator[];
};

export type GroupContextType = {
  direction: Direction;
  id: string;
  registerPanel: (panel: RegisteredPanel) => () => void;
  registerSeparator: (separator: RegisteredSeparator) => () => void;
};

export type GroupImperativeHandle = {
  /**
   * Get the Group's current layout as a map of Panel id to percentage (0..100)
   */
  getLayout: () => { [panelId: string]: number };

  /**
   * Set a new layout for the Group
   *
   * @param layout Map of Panel id to percentage (0..100)
   * @return Applied layout (after validation)
   */
  setLayout: (layout: { [panelId: string]: number }) => Layout;
};

export type GroupProps = {
  /**
   * Panel and Separator components that comprise this group.
   */
  children?: ReactNode;

  /**
   * CSS class name.
   */
  className?: string;

  /**
   * Default layout for the Group.
   *
   * ℹ️ This value allows layouts to be remembered between page reloads.
   *
   * ⚠️ Refer to the documentation for how to avoid layout shift when using server components.
   */
  defaultLayout?: Layout;

  /**
   * Specifies the resizable direction ("horizontal" or "vertical"); defaults to "horizontal"
   */
  direction?: "horizontal" | "vertical";

  /**
   * This library sets custom mouse cursor styles to indicate drag state.
   * Use this prop to disable that behavior for Panels and Separators in this group.
   */
  disableCursor?: boolean;

  /**
   * Disable resize functionality.
   */
  disabled?: boolean;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement>;

  /**
   * Exposes the following imperative API:
   * - `getLayout(): Layout`
   * - `setLayout(layout: Layout): void`
   *
   * ℹ️ The `useGroupRef` and `useGroupCallbackRef` hooks are exported for convenience use in TypeScript projects.
   */
  groupRef?: Ref<GroupImperativeHandle>;

  /**
   * Uniquely identifies this group within an application.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-group-id` attribute.
   */
  id?: string | number;

  /**
   * Called when panel sizes change; receives a map of Panel id to size.
   */
  onLayoutChange?: (layout: Layout) => void;

  /**
   * CSS properties.
   *
   * ⚠️ The following styles cannot be overridden: `display`, `flex-direction`, `flex-wrap`, and `overflow`.
   */
  style?: CSSProperties;
};

export type OnGroupLayoutChange = GroupProps["onLayoutChange"];
