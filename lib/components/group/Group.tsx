"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { mountGroup } from "../../global/mountGroup";
import { eventEmitter, read } from "../../global/mutableState";
import { layoutsEqual } from "../../global/utils/layoutsEqual";
import { useForceUpdate } from "../../hooks/useForceUpdate";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { useStableObject } from "../../hooks/useStableObject";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredSeparator } from "../separator/types";
import { GroupContext } from "./GroupContext";
import { sortByElementOffset } from "./sortByElementOffset";
import type {
  GroupProps,
  Layout,
  RegisteredGroup,
  ResizeTargetMinimumSize
} from "./types";
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
  onLayoutChanged: onLayoutChangedUnstable,
  orientation = "horizontal",
  resizeTargetMinimumSize = {
    coarse: 20,
    fine: 10
  },
  style,
  ...rest
}: GroupProps) {
  const prevLayoutRef = useRef<{
    onLayoutChange: Layout;
    onLayoutChanged: Layout;
  }>({
    onLayoutChange: {},
    onLayoutChanged: {}
  });

  const onLayoutChangeStable = useStableCallback((layout: Layout) => {
    if (layoutsEqual(prevLayoutRef.current.onLayoutChange, layout)) {
      // Memoize callback
      return;
    }

    prevLayoutRef.current.onLayoutChange = layout;
    onLayoutChangeUnstable?.(layout);
  });

  const onLayoutChangedStable = useStableCallback((layout: Layout) => {
    if (layoutsEqual(prevLayoutRef.current.onLayoutChanged, layout)) {
      // Memoize callback
      return;
    }

    prevLayoutRef.current.onLayoutChanged = layout;
    onLayoutChangedUnstable?.(layout);
  });

  const id = useId(idProp);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const [panelOrSeparatorChangeSigil, forceUpdate] = useForceUpdate();

  const inMemoryValuesRef = useRef<{
    lastExpandedPanelSizes: { [panelIds: string]: number };
    layouts: { [panelIds: string]: Layout };
    panels: RegisteredPanel[];
    resizeTargetMinimumSize: ResizeTargetMinimumSize;
    separators: RegisteredSeparator[];
  }>({
    lastExpandedPanelSizes: {},
    layouts: {},
    panels: [],
    resizeTargetMinimumSize,
    separators: []
  });

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  useGroupImperativeHandle(id, groupRef);

  // TRICKY Don't read for state; it will always lag behind by one tick
  const getPanelStyles = useStableCallback(
    (groupId: string, panelId: string) => {
      const { interactionState, mountedGroups } = read();

      for (const group of mountedGroups.keys()) {
        if (group.id === groupId) {
          const match = mountedGroups.get(group);
          if (match) {
            let dragActive = false;
            switch (interactionState.state) {
              case "active": {
                dragActive = interactionState.hitRegions.some(
                  (current) => current.group === group
                );
                break;
              }
            }

            return {
              flexGrow: match.layout[panelId] ?? 1,
              pointerEvents: dragActive ? "none" : undefined
            } satisfies CSSProperties;
          }
        }
      }

      // This is unexpected except for the initial mount (before the group has registered with the global store)
      return {
        flexGrow: defaultLayout?.[panelId] ?? 1
      } satisfies CSSProperties;
    }
  );

  const context = useMemo(
    () => ({
      getPanelStyles,
      id,
      orientation,
      registerPanel: (panel: RegisteredPanel) => {
        const inMemoryValues = inMemoryValuesRef.current;
        inMemoryValues.panels = sortByElementOffset(orientation, [
          ...inMemoryValues.panels,
          panel
        ]);

        forceUpdate();

        return () => {
          inMemoryValues.panels = inMemoryValues.panels.filter(
            (current) => current !== panel
          );

          forceUpdate();
        };
      },
      registerSeparator: (separator: RegisteredSeparator) => {
        const inMemoryValues = inMemoryValuesRef.current;
        inMemoryValues.separators = sortByElementOffset(orientation, [
          ...inMemoryValues.separators,
          separator
        ]);

        forceUpdate();

        return () => {
          inMemoryValues.separators = inMemoryValues.separators.filter(
            (current) => current !== separator
          );

          forceUpdate();
        };
      }
    }),
    [getPanelStyles, id, forceUpdate, orientation]
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

    const inMemoryValues = inMemoryValuesRef.current;

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
      panels: inMemoryValues.panels,
      resizeTargetMinimumSize: inMemoryValues.resizeTargetMinimumSize,
      separators: inMemoryValues.separators
    };

    registeredGroupRef.current = group;

    const unmountGroup = mountGroup(group);

    const globalState = read();
    const match = globalState.mountedGroups.get(group);
    if (match) {
      const { defaultLayoutDeferred, derivedPanelConstraints, layout } = match;

      if (!defaultLayoutDeferred && derivedPanelConstraints.length > 0) {
        onLayoutChangeStable(layout);
        onLayoutChangedStable(layout);

        inMemoryValues.panels.forEach((panel) => {
          panel.scheduleUpdate();
        });
      }
    }

    let prevInteractionStateActive = false;

    const removeInteractionStateChangeListener = eventEmitter.addListener(
      "interactionStateChange",
      (interactionState) => {
        const nextInteractionStateActive = interactionState.state === "active";
        if (prevInteractionStateActive !== nextInteractionStateActive) {
          prevInteractionStateActive = nextInteractionStateActive;

          // The only reason to schedule a re-render in response to this event type
          // is to disable pointer-events within a Panel while a drag is in progress
          // (This is done to prevent text from being selected, etc)
          // Unnecessary updates should be very fast in this case but we can still avoid them
          inMemoryValues.panels.forEach((panel) => {
            panel.scheduleUpdate();
          });
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

          const { interactionState } = read();
          const isCompleted = interactionState.state !== "active";

          onLayoutChangeStable(layout);
          if (isCompleted) {
            onLayoutChangedStable(layout);
          }

          inMemoryValues.panels.forEach((panel) => {
            panel.scheduleUpdate();
          });
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
    onLayoutChangedStable,
    onLayoutChangeStable,
    orientation,
    panelOrSeparatorChangeSigil,
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
          height: "100%",
          width: "100%",
          overflow: "hidden",
          ...style,
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

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Group.displayName = "Group";
