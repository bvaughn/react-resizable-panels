"use client";

import { useImperativeHandle, useRef } from "react";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useMutablePanel } from "./hooks/useMutablePanel";
import type { PanelProps } from "./types";

/**
 * A Panel wraps resizable content and can be configured with min/max size constraints and collapsible behavior.
 *
 * Panel size props can be in the following formats:
 * - Percentage of the parent Group (0..100)
 * - Pixels
 * - Relative font units (em, rem)
 * - Viewport relative units (vh, vw)
 *
 * ℹ️ Numeric values are assumed to be pixels.
 * Strings without explicit units are assumed to be percentages (0%..100%).
 * Percentages may also be specified as strings ending with "%" (e.g. "33%")
 * Pixels may also be specified as strings ending with the unit "px".
 * Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)
 *
 * Panel elements always include the following attributes:
 *
 * ```html
 * <div data-panel data-testid="panel-id-prop" id="panel-id-prop">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 *
 * ⚠️ Panel elements must be direct DOM children of their parent Group elements.
 */
export function Panel({
  children,
  className,
  collapsedSize,
  collapsible,
  defaultSize,
  elementRef: elementRefProp,
  id: idProp,
  maxSize,
  minSize,
  onResize,
  panelRef,
  style: styleProp,
  ...rest
}: PanelProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const { id, imperativeHandle, style } = useMutablePanel({
    collapsedSize,
    collapsible,
    elementRef,
    defaultSize,
    id: idProp,
    maxSize,
    minSize,
    onResize
  });

  useImperativeHandle(panelRef, () => imperativeHandle, [imperativeHandle]);

  return (
    <div
      {...rest}
      data-panel
      data-testid={id}
      id={id}
      ref={mergedRef}
      style={style}
    >
      <div
        className={className}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          flexGrow: 1,

          ...styleProp
        }}
      >
        {children}
      </div>
    </div>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Panel.displayName = "Panel";
