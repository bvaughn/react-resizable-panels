import type { Property } from "csstype";
import { useState } from "react";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../hooks/useStableCallback";
import { getPanelSizeCssPropertyName } from "../group/getPanelSizeCssPropertyName";
import { useGroupContext } from "../group/useGroupContext";
import { POINTER_EVENTS_CSS_PROPERTY_NAME } from "./constants";
import type { PanelProps, PanelSize } from "./types";
import { usePanelImperativeHandle } from "./usePanelImperativeHandle";
import { useMergedRefs } from "../../hooks/useMergedRefs";

// TODO Validate CSS styles
// Warn and remove the following: width/height (including min/max), flex/flex-basis/flex-grow/flex-shrink, and padding

/**
 * A Panel wraps resizable content and can be configured with min/max size constraints and collapsible behavior.
 *
 * Panel size props can be specified using the following CSS units:
 * - Pixels (default if value is of type `number`)
 * - Percentages (default if value is of type `string`)
 * - Font sizes (em, rem)
 * - Viewport sizes (vh, vw)
 *
 * For unit testing purposes, Panel elements always include the following data attributes:
 *
 * ```html
 * <div data-panel data-panel-id="your-panel-id">
 * ```
 */
export function Panel({
  children,
  className,
  collapsedSize = 0,
  collapsible = false,
  defaultSize,
  elementRef,
  id: idProp,
  maxSize = "100",
  minSize = "0",
  onResize: onResizeUnstable,
  panelRef,
  style
}: PanelProps) {
  const idIsStable = !!idProp;

  const id = useId(idProp);

  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const mergedRef = useMergedRefs(setElement, elementRef);

  const { registerPanel } = useGroupContext();

  const hasOnResize = onResizeUnstable !== null;
  const onResizeStable = useStableCallback((panelSize: PanelSize) => {
    onResizeUnstable?.(panelSize);
  });

  // Register Panel with parent Group
  useIsomorphicLayoutEffect(() => {
    if (element !== null) {
      return registerPanel({
        element,
        id,
        idIsStable,
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
    element,
    hasOnResize,
    id,
    idIsStable,
    maxSize,
    minSize,
    onResizeStable,
    registerPanel
  ]);

  usePanelImperativeHandle(id, panelRef);

  const flexGrowVar = getPanelSizeCssPropertyName(id);

  return (
    <div
      data-panel
      data-panel-id={id}
      ref={mergedRef}
      style={{
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
