"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties
} from "react";
import { subscribeToMountedGroup } from "../../global/mutable-state/groups";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { useStableObject } from "../../hooks/useStableObject";
import { useGroupContext } from "../group/useGroupContext";
import type { PanelProps, PanelSize, RegisteredPanel } from "./types";
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
 *
 * ⚠️ Panel elements must be direct DOM children of their parent Group elements.
 */
export function Panel({
  children,
  className,
  collapsedSize = "0%",
  collapsible = false,
  defaultSize,
  disabled,
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

  const stableProps = useStableObject({
    disabled
  });

  const elementRef = useRef<HTMLDivElement | null>(null);

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const {
    getPanelStyles,
    id: groupId,
    orientation,
    registerPanel,
    togglePanelDisabled
  } = useGroupContext();

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
      const registeredPanel: RegisteredPanel = {
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
          disabled: stableProps.disabled,
          maxSize,
          minSize
        }
      };

      return registerPanel(registeredPanel);
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
    registerPanel,
    stableProps
  ]);

  // Not all props require re-registering the panel;
  useEffect(() => {
    togglePanelDisabled(id, !!disabled);
  }, [disabled, id, togglePanelDisabled]);

  usePanelImperativeHandle(id, panelRef);

  const panelStylesString = useSyncExternalStore(
    (subscribe) => subscribeToMountedGroup(groupId, subscribe),

    // useSyncExternalStore does not support a custom equality check
    // stringify avoids re-rendering when the style value hasn't changed
    () => JSON.stringify(getPanelStyles(groupId, id)),
    () => JSON.stringify(getPanelStyles(groupId, id))
  );

  return (
    <div
      {...rest}
      aria-disabled={disabled || undefined}
      data-panel
      data-testid={id}
      id={id}
      ref={mergedRef}
      style={{
        ...PROHIBITED_CSS_PROPERTIES,

        display: "flex",
        flexBasis: 0,
        flexShrink: 1,

        // Prevent Panel content from interfering with panel size
        overflow: "hidden",

        ...JSON.parse(panelStylesString)
      }}
    >
      <div
        className={className}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          flexGrow: 1,

          ...style,

          // Inform the browser that the library is handling touch events for this element
          // but still allow users to scroll content within panels in the non-resizing direction
          // NOTE This is not an inherited style
          // See github.com/bvaughn/react-resizable-panels/issues/662
          touchAction: orientation === "horizontal" ? "pan-y" : "pan-x"
        }}
      >
        {children}
      </div>
    </div>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Panel.displayName = "Panel";

const PROHIBITED_CSS_PROPERTIES: CSSProperties = {
  minHeight: 0,
  maxHeight: "100%",
  height: "auto",

  minWidth: 0,
  maxWidth: "100%",
  width: "auto",

  border: "none",
  borderWidth: 0,
  padding: 0,
  margin: 0
};
