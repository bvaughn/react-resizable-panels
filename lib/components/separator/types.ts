import type { CSSProperties, PropsWithChildren, Ref } from "react";

export type RegisteredSeparator = {
  element: HTMLDivElement;
  id: string;
};

export type SeparatorProps = PropsWithChildren<{
  /**
   * CSS class name.
   *
   * ℹ️ Use the `data-separator-state` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  className?: string;

  /**
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement>;

  /**
   * Uniquely identifies the separator within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-separator-id` attribute.
   */
  id?: string | number;

  /**
   * CSS properties.
   *
   * ℹ️ Use the `data-separator-state` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  style?: CSSProperties;
}>;
