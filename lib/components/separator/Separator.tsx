"use client";

import { useId } from "../../hooks/useId";
import { useGroupContext } from "../group/useGroupContext";
import { ResizeSeparator } from "../shared/ResizeSeparator";
import type { SeparatorProps } from "./types";

// Separators are flex items within their parent Group
const STYLE_DEFAULTS = { flexBasis: "auto" } as const;
const REQUIRED_STYLE = { flexGrow: 0, flexShrink: 0 } as const;

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
  disabled,
  disableDoubleClick,
  elementRef,
  id: idProp,
  preview,
  style,
  ...rest
}: SeparatorProps) {
  const id = useId(idProp);

  const {
    disableCursor,
    id: groupId,
    orientation,
    registerSeparator,
    updateSeparatorProps
  } = useGroupContext();

  return (
    <ResizeSeparator
      attributes={rest}
      axisId={groupId}
      axisOrientation={orientation}
      className={className}
      disableCursor={disableCursor}
      disabled={disabled}
      disableDoubleClick={disableDoubleClick}
      elementRef={elementRef}
      id={id}
      preview={preview}
      registerSeparator={registerSeparator}
      requiredStyle={REQUIRED_STYLE}
      style={style}
      styleDefaults={STYLE_DEFAULTS}
      updateSeparatorProps={updateSeparatorProps}
    >
      {children}
    </ResizeSeparator>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Separator.displayName = "Separator";
