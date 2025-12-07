"use client";
import { useMemo, useRef, useState } from "react";
import { mountGroup } from "../../global/mountGroup";
import { eventEmitter, read } from "../../global/mutableState";
import { layoutsEqual } from "../../global/utils/layoutsEqual";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { POINTER_EVENTS_CSS_PROPERTY_NAME } from "../panel/constants";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";
import { getPanelSizeCssPropertyName } from "./getPanelSizeCssPropertyName";
import { GroupContext } from "./GroupContext";
import { sortByElementOffset } from "./sortByElementOffset";
import type { GroupProps, Layout, RegisteredGroup } from "./types";
import { useGroupImperativeHandle } from "./useGroupImperativeHandle";

// TODO Validate unique Panel and Separator ids
// TODO Warn if Group is defaultLayout is provided and Panel(s) do not have ids

/**
 * A Group wraps a set of resizable Panel components.
 * Group content can be resized _horizontally_ or _vertically_.
 *
 * For unit testing purposes, Group elements always include the following data attributes:
 *
 * ```html
 * <div data-group="your-group-id">
 * ```
 */
export function Group({
  children,
  className,
  defaultLayout,
  disableCursor,
  disabled,
  elementRef,
  groupRef,
  id: idProp,
  onLayoutChange: onLayoutChangeUnstable,
  orientation = "horizontal",
  style
}: GroupProps) {
  const prevLayoutRef = useRef<Layout>({});

  const onLayoutChangeStable = useStableCallback((layout: Layout) => {
    if (layoutsEqual(prevLayoutRef.current, layout)) {
      // Memoize callback
      return;
    }

    prevLayoutRef.current = layout;
    onLayoutChangeUnstable?.(layout);
  });

  const id = useId(idProp);

  const [dragActive, setDragActive] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const inMemoryLayoutsRef = useRef<{
    [panelIds: string]: Layout;
  }>({});
  const [layout, setLayout] = useState<Layout>(defaultLayout ?? {});
  const [panels, setPanels] = useState<RegisteredPanel[]>([]);
  const [separators, setSeparators] = useState<RegisteredSeparator[]>([]);

  const mergedRef = useMergedRefs(setElement, elementRef);

  useGroupImperativeHandle(id, groupRef);

  const context = useMemo(
    () => ({
      id,
      orientation,
      registerPanel: (panel: RegisteredPanel) => {
        setPanels((prev) => sortByElementOffset(orientation, [...prev, panel]));
        return () => {
          setPanels((prev) => prev.filter((current) => current !== panel));
        };
      },
      registerSeparator: (separator: RegisteredSeparator) => {
        setSeparators((prev) =>
          sortByElementOffset(orientation, [...prev, separator])
        );
        return () => {
          setSeparators((prev) =>
            prev.filter((current) => current !== separator)
          );
        };
      }
    }),
    [id, orientation]
  );

  // Register Group and child Panels/Separators with global state
  // Listen to global state for drag state related to this Group
  useIsomorphicLayoutEffect(() => {
    if (element !== null && panels.length > 0) {
      const group: RegisteredGroup = {
        defaultLayout,
        disableCursor: !!disableCursor,
        disabled: !!disabled,
        element,
        id,
        inMemoryLayouts: inMemoryLayoutsRef.current,
        orientation,
        panels,
        separators
      };

      const unmountGroup = mountGroup(group);

      const globalState = read();
      const match = globalState.mountedGroups.get(group);
      if (match) {
        setLayout(match.layout);
        onLayoutChangeStable?.(match.layout);
      }

      const removeInteractionStateChangeListener = eventEmitter.addListener(
        "interactionStateChange",
        (interactionState) => {
          switch (interactionState.state) {
            case "active":
            case "hover": {
              setDragActive(
                interactionState.hitRegions.some(
                  (current) => current.group === group
                )
              );
              break;
            }
          }
        }
      );

      const removeMountedGroupsChangeEventListener = eventEmitter.addListener(
        "mountedGroupsChange",
        (mountedGroups) => {
          const match = mountedGroups.get(group);
          if (match && match.derivedPanelConstraints.length > 0) {
            setLayout(match.layout);
            onLayoutChangeStable?.(match.layout);
          }
        }
      );

      return () => {
        unmountGroup();
        removeInteractionStateChangeListener();
        removeMountedGroupsChangeEventListener();
      };
    }
  }, [
    defaultLayout,
    disableCursor,
    disabled,
    element,
    id,
    onLayoutChangeStable,
    orientation,
    panels,
    separators
  ]);

  // Panel layouts and Group dragging state are shared via CSS variables
  const cssVariables: { [key: string]: number | string | undefined } = {
    [POINTER_EVENTS_CSS_PROPERTY_NAME]: dragActive ? "none" : undefined
  };
  for (const panelId in layout) {
    const propertyName = getPanelSizeCssPropertyName(id, panelId);
    const flexGrow = layout[panelId];
    cssVariables[propertyName] = flexGrow;
  }

  return (
    <GroupContext.Provider value={context}>
      <div
        aria-orientation={orientation}
        className={className}
        data-group={id}
        ref={mergedRef}
        style={{
          ...style,
          ...cssVariables,
          display: "flex",
          flexDirection: orientation === "horizontal" ? "row" : "column",
          flexWrap: "nowrap"
        }}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}
