"use client";

import { useRef } from "react";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import type { SeparatorProps } from "./types";
import { useMutableSeparator } from "./hooks/useMutableSeparator";

/**
 * Separators are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * ⚠️ Separator elements must be direct DOM children of their parent Group elements.
 *
 * Separator elements always include the following attributes:
 *
 * ```html
 * <div data-separator data-testid="separator-id-prop" id="separator-id-prop" role="separator">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 *
 * ℹ️ In addition to the attributes shown above, separator also renders all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).
 */
export function Separator({
  children,
  className,
  elementRef: elementRefProp,
  id: idProp,
  style,
  ...rest
}: SeparatorProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const { ariaAttributes, dragState, id } = useMutableSeparator({
    elementRef,
    id: idProp
  });

  return (
    <div
      {...rest}
      aria-controls={ariaAttributes?.ariaControls}
      aria-valuemax={ariaAttributes?.ariaValueMax}
      aria-valuemin={ariaAttributes?.ariaValueMin}
      aria-valuenow={ariaAttributes?.ariaValueNow}
      children={children}
      className={className}
      data-separator={dragState}
      data-testid={id}
      id={id}
      ref={mergedRef}
      role="separator"
      style={{
        flexBasis: "auto",
        ...style,
        flexGrow: 0,
        flexShrink: 0
      }}
      tabIndex={0}
    />
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Separator.displayName = "Separator";
