"use client";

import type { Property } from "csstype";
import { useRef, type CSSProperties } from "react";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { getPanelSizeCssPropertyName } from "../group/getPanelSizeCssPropertyName";
import { useGroupContext } from "../group/useGroupContext";
import { POINTER_EVENTS_CSS_PROPERTY_NAME } from "./constants";
import type { PanelProps, PanelSize } from "./types";
import { usePanelImperativeHandle } from "./usePanelImperativeHandle";

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
 */
export function Panel({
  children,
  className,
  collapsedSize = "0%",
  collapsible = false,
  defaultSize,
  elementRef: elementRefProp,
  id: idProp,
  maxSize = "100%",
  minSize = "0%",
  onResize: onResizeUnstable,
  panelRef,
  style,
  ...rest
}: PanelProps) {
  const idIsStable = !!idProp;

  const id = useId(idProp);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const { id: groupId, registerPanel } = useGroupContext();

  const hasOnResize = onResizeUnstable !== null;
  const onResizeStable = useStableCallback(
    (
      panelSize: PanelSize,
      _: string | number | undefined,
      prevPanelSize: PanelSize | undefined
    ) => {
      onResizeUnstable?.(panelSize, idProp, prevPanelSize);
    }
  );

  // Register Panel with parent Group
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element !== null) {
      return registerPanel({
        element,
        id,
        idIsStable,
        mutableValues: {
          expandToSize: undefined,
          prevSize: undefined
        },
        onResize: hasOnResize ? onResizeStable : undefined,
        panelConstraints: {
          collapsedSize,
          collapsible,
          defaultSize,
          maxSize,
          minSize
        }
      });
    }
  }, [
    collapsedSize,
    collapsible,
    defaultSize,
    hasOnResize,
    id,
    idIsStable,
    maxSize,
    minSize,
    onResizeStable,
    registerPanel
  ]);

  usePanelImperativeHandle(id, panelRef);

  const flexGrowVar = getPanelSizeCssPropertyName(groupId, id);

  return (
    <div
      {...rest}
      data-panel
      data-testid={id}
      id={id}
      ref={mergedRef}
      style={{
        ...PROHIBITED_CSS_PROPERTIES,

        flexBasis: 0,
        flexGrow: `var(${flexGrowVar}, 1)`,
        flexShrink: 1,

        // Prevent Panel content from interfering with panel size
        overflow: "hidden",

        // Disable pointer events inside of a panel during resize
        // This avoid edge cases like nested iframes
        pointerEvents:
          `var(${POINTER_EVENTS_CSS_PROPERTY_NAME})` as Property.PointerEvents
      }}
    >
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          ...style
        }}
      >
        {children}
      </div>
    </div>
  );
}

const PROHIBITED_CSS_PROPERTIES: CSSProperties = {
  minHeight: "unset",
  maxHeight: "unset",
  height: "unset",

  minWidth: "unset",
  maxWidth: "unset",
  width: "unset",

  flex: "unset",
  flexBasis: "unset",
  flexShrink: "unset",
  flexGrow: "unset",

  border: "unset",
  borderWidth: "unset",
  padding: "unset",
  margin: "unset"
};
