import type { CSSProperties, ReactNode, Ref } from "react";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredResizeHandle } from "../resize-handle/types";

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
  resizeHandleId: string | undefined;
};

export type RegisteredGroup = {
  autoSave: boolean;
  direction: Direction;
  disableCursor: boolean;
  element: HTMLElement;
  id: string;
  panels: RegisteredPanel[];
  resizeHandles: RegisteredResizeHandle[];
  storage: Storage | undefined;
};

export type GroupContextType = {
  direction: Direction;
  id: string;
  registerPanel: (panel: RegisteredPanel) => () => void;
  registerResizeHandle: (resizeHandle: RegisteredResizeHandle) => () => void;
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
   * Remember Panel layouts between page reload.
   *
   * ℹ️ Layouts are saved using `localStorage` by default but can be customized using the `storage` prop.
   *
   * ⚠️ The `id` prop must also be specified for auto-save groups.
   */
  autoSave?: boolean;

  /**
   * Panel and ResizeHandle components that comprise this group.
   */
  children?: ReactNode;

  /**
   * CSS class name.
   */
  className?: string;

  /**
   * Specifies the resizable direction ("horizontal" or "vertical"); defaults to "horizontal"
   */
  direction?: Direction;

  /**
   * This library sets custom mouse cursor styles to indicate drag state.
   * Use this prop to disable that behavior for Panels and ResizeHandles in this group.
   */
  disableCursor?: boolean;

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
   *
   * ⚠️ This prop must be provided if `autoSize` is true.
   */
  id?: string | number;

  /**
   * Called when panel sizes change; receives a map of Panel id to size.
   */
  onLayoutChange?: (layout: Layout) => void;

  /**
   * Storage API to use for persisted layouts; defaults to `localStorage`.
   *
   * Use this prop support environments where `localStorage` is not available,
   * such as server-side rendering or in a browser with cookies/storage disabled.
   *
   * ℹ️ The `storage` API is synchronous.
   * Async values should be pre-fetched during the initial render using e.g. Suspense.
   *
   * ℹ️ Calls to `storage.setItem` are debounced by 100ms.
   */
  storage?: Storage;

  /**
   * CSS properties.
   *
   * ⚠️ The following styles cannot be overridden: `display`, `flex-direction`, `flex-wrap`, and `overflow`.
   */
  style?: CSSProperties;
};

export type OnGroupLayoutChange = GroupProps["onLayoutChange"];
