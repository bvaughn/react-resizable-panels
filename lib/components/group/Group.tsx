"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mountGroup } from "../../global/mountGroup";
import { eventEmitter, read } from "../../global/mutableState";
import { layoutsEqual } from "../../global/utils/layoutsEqual";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { useStableObject } from "../../hooks/useStableObject";
import { POINTER_EVENTS_CSS_PROPERTY_NAME } from "../panel/constants";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";
import { getPanelSizeCssPropertyName } from "./getPanelSizeCssPropertyName";
import { GroupContext } from "./GroupContext";
import { sortByElementOffset } from "./sortByElementOffset";
import type { GroupProps, Layout, RegisteredGroup } from "./types";
import { useGroupImperativeHandle } from "./useGroupImperativeHandle";

/**
 * A Group wraps a set of resizable Panel components.
 * Group content can be resized _horizontally_ or _vertically_.
 *
 * Group elements always include the following attributes:
 *
 * ```html
 * <div data-group data-testid="group-id-prop" id="group-id-prop">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 */
export function Group({
  children,
  className,
  defaultLayout,
  disableCursor,
  disabled,
  elementRef: elementRefProp,
  groupRef,
  id: idProp,
  onLayoutChange: onLayoutChangeUnstable,
  orientation = "horizontal",
  style,
  ...rest
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
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<Layout>(defaultLayout ?? {});
  const [panels, setPanels] = useState<RegisteredPanel[]>([]);
  const [separators, setSeparators] = useState<RegisteredSeparator[]>([]);

  const inMemoryValuesRef = useRef<{
    lastExpandedPanelSizes: { [panelIds: string]: number };
    layouts: { [panelIds: string]: Layout };
  }>({
    lastExpandedPanelSizes: {},
    layouts: {}
  });

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

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

  const stableProps = useStableObject({
    defaultLayout,
    disableCursor
  });

  const registeredGroupRef = useRef<RegisteredGroup | null>(null);

  // Register Group and child Panels/Separators with global state
  // Listen to global state for drag state related to this Group
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element === null) {
      return;
    }

    const group: RegisteredGroup = {
      defaultLayout: stableProps.defaultLayout,
      disableCursor: !!stableProps.disableCursor,
      disabled: !!disabled,
      element,
      id,
      inMemoryLastExpandedPanelSizes:
        inMemoryValuesRef.current.lastExpandedPanelSizes,
      inMemoryLayouts: inMemoryValuesRef.current.layouts,
      orientation,
      panels,
      separators
    };

    registeredGroupRef.current = group;

    const unmountGroup = mountGroup(group);

    const globalState = read();
    const match = globalState.mountedGroups.get(group);
    if (match) {
      const { defaultLayoutDeferred, derivedPanelConstraints, layout } = match;

      if (!defaultLayoutDeferred && derivedPanelConstraints.length > 0) {
        // This indicates that the Group has not finished mounting yet
        // Likely because it has been rendered inside of a hidden DOM subtree
        // Ignore layouts in this case because they will not have been validated
        setLayout(layout);
        onLayoutChangeStable?.(layout);
      }
    }

    const removeInteractionStateChangeListener = eventEmitter.addListener(
      "interactionStateChange",
      (interactionState) => {
        switch (interactionState.state) {
          case "active": {
            setDragActive(
              interactionState.hitRegions.some(
                (current) => current.group === group
              )
            );
            break;
          }
          default: {
            setDragActive(false);
            break;
          }
        }
      }
    );

    const removeMountedGroupsChangeEventListener = eventEmitter.addListener(
      "mountedGroupsChange",
      (mountedGroups) => {
        const match = mountedGroups.get(group);
        if (match) {
          const { defaultLayoutDeferred, derivedPanelConstraints, layout } =
            match;

          if (defaultLayoutDeferred || derivedPanelConstraints.length === 0) {
            // This indicates that the Group has not finished mounting yet
            // Likely because it has been rendered inside of a hidden DOM subtree
            // Ignore layouts in this case because they will not have been validated
            return;
          }

          setLayout(layout);
          onLayoutChangeStable?.(layout);
        }
      }
    );

    return () => {
      registeredGroupRef.current = null;

      unmountGroup();
      removeInteractionStateChangeListener();
      removeMountedGroupsChangeEventListener();
    };
  }, [
    disabled,
    id,
    onLayoutChangeStable,
    orientation,
    panels,
    separators,
    stableProps
  ]);

  // Not all props require re-registering the group;
  // Some can be updated after the group has been registered
  useEffect(() => {
    const registeredGroup = registeredGroupRef.current;
    if (registeredGroup) {
      registeredGroup.defaultLayout = defaultLayout;
      registeredGroup.disableCursor = !!disableCursor;
    }
  });

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
        {...rest}
        aria-orientation={orientation}
        className={className}
        data-group
        data-testid={id}
        id={id}
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
