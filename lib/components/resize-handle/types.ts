import type { CSSProperties, PropsWithChildren, Ref } from "react";

export type RegisteredResizeHandle = {
  element: HTMLDivElement;
  id: string;
};

export type ResizeHandleProps = PropsWithChildren<{
  /**
   * CSS class name.
   *
   * ℹ️ Use the `data-resize-handle-state` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  className?: string;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement>;

  /**
   * Uniquely identifies the resize handle within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-resize-handle-id` attribute.
   */
  id?: string | number;

  /**
   * CSS properties.
   *
   * ℹ️ Use the `data-resize-handle-state` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  style?: CSSProperties;
}>;
