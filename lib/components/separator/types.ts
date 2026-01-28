import type { CSSProperties, HTMLAttributes, Ref } from "react";

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
   * Ref attached to the root `HTMLDivElement`.
   */
  elementRef?: Ref<HTMLDivElement> | undefined;

  /**
   * Uniquely identifies the separator within the parent group.
   * Falls back to `useId` when not provided.
   *
   * ℹ️ This value will also be assigned to the `data-separator` attribute.
   */
  id?: string | number | undefined;

  /**
   * CSS properties.
   *
   * ℹ️ Use the `data-separator` attribute for custom _hover_ and _active_ styles
   *
   * ⚠️ The following properties cannot be overridden: `flex-grow`, `flex-shrink`
   */
  style?: CSSProperties | undefined;
};
