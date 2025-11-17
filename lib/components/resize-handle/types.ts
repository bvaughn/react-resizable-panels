import type { CSSProperties, PropsWithChildren } from "react";

export type RegisteredResizeHandle = {
  element: HTMLDivElement;
  id: string;
};

export type ResizeHandleProps = PropsWithChildren<{
  /**
   * CSS class name.
   */
  className?: string;

  /**
   * Uniquely identifies the resize handle within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-resize-handle-id` attribute.
   */
  id?: string | number;

  /**
   * CSS properties.
   */
  style?: CSSProperties;
}>;
