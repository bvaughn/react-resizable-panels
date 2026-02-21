"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { calculatePanelConstraints } from "../../global/dom/calculatePanelConstraints";
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

  const stableProps = useStableObject({
    defaultLayout,
    disableCursor
  });

  const context = useMemo(
    () => ({
      get disableCursor() {
        return !!stableProps.disableCursor;
      },
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
      },
      togglePanelDisabled: (panelId: string, disabled: boolean) => {
        const inMemoryValues = inMemoryValuesRef.current;
        const panel = inMemoryValues.panels.find(
          (current) => current.id === panelId
        );
        if (panel) {
          panel.panelConstraints.disabled = disabled;
        }

        const { mountedGroups } = read();
        for (const group of mountedGroups.keys()) {
          if (group.id === id) {
            const match = mountedGroups.get(group);
            if (match) {
              match.derivedPanelConstraints = calculatePanelConstraints(group);
            }
          }
        }
      },
      toggleSeparatorDisabled: (separatorId: string, disabled: boolean) => {
        const inMemoryValues = inMemoryValuesRef.current;
        const separator = inMemoryValues.separators.find(
          (current) => current.id === separatorId
        );
        if (separator) {
          separator.disabled = disabled;
        }
      }
    }),
    [getPanelStyles, id, forceUpdate, orientation, stableProps]
  );

  const registeredGroupRef = useRef<RegisteredGroup | null>(null);

  // Register Group and child Panels/Separators with global state
  // Listen to global state for drag state related to this Group
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element === null) {
      return;
    }

    const inMemoryValues = inMemoryValuesRef.current;

    // Guard against unexpected layout attribute ordering by pre-sorting panel ids/keys; see issues/656
    let preSortedDefaultLayout: Layout | undefined = undefined;
    if (stableProps.defaultLayout !== undefined) {
      if (
        Object.keys(stableProps.defaultLayout).length ===
        inMemoryValues.panels.length
      ) {
        preSortedDefaultLayout = {};
        for (const panel of inMemoryValues.panels) {
          const size = stableProps.defaultLayout[panel.id];
          if (size !== undefined) {
            preSortedDefaultLayout[panel.id] = size;
          }
        }
      }
    }

    const group: RegisteredGroup = {
      defaultLayout: preSortedDefaultLayout,
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
      }
    }

    let prevInteractionStateActive = false;

    const removeInteractionStateChangeListener = eventEmitter.addListener(
      "interactionStateChange",
      (interactionState) => {
        const nextInteractionStateActive = interactionState.state === "active";
        if (prevInteractionStateActive !== nextInteractionStateActive) {
          prevInteractionStateActive = nextInteractionStateActive;
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

          // Save the layout to in-memory cache so it persists when panel configuration changes
          // This improves UX for conditionally rendered panels without requiring defaultLayout
          const panelIdsKey = group.panels.map(({ id }) => id).join(",");
          group.inMemoryLayouts[panelIdsKey] = layout;

          const { interactionState } = read();
          const isCompleted = interactionState.state !== "active";

          onLayoutChangeStable(layout);
          if (isCompleted) {
            onLayoutChangedStable(layout);
          }
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
          flexWrap: "nowrap",

          // Inform the browser that the library is handling touch events for this element
          // but still allow users to scroll content within panels in the non-resizing direction
          // NOTE This is not an inherited style
          // See github.com/bvaughn/react-resizable-panels/issues/662
          touchAction: orientation === "horizontal" ? "pan-y" : "pan-x"
        }}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Group.displayName = "Group";
