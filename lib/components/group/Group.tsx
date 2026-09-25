"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";
import { calculatePanelConstraints } from "../../global/dom/calculatePanelConstraints";
import { mountGroup } from "../../global/mountGroup";
import {
  getMountedGroupState,
  getRegisteredGroup,
  subscribeToMountedGroup,
  updateMountedGroup
} from "../../global/mutable-state/groups";
import { getInteractionState } from "../../global/mutable-state/interactions";
import { layoutsEqual } from "../../global/utils/layoutsEqual";
import { recordGroupLayoutChange } from "../../global/utils/recordGroupLayoutChange";
import { useForceUpdate } from "../../hooks/useForceUpdate";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { useStableObject } from "../../hooks/useStableObject";
import type { RegisteredPanel } from "../panel/types";
import type {
  RegisteredSeparator,
  SeparatorOverlayProps
} from "../separator/types";
import { GroupContext } from "./GroupContext";
import { ResizePreview } from "./ResizePreview";
import { sortByElementOffset } from "./sortByElementOffset";
import type { GroupProps, Layout, RegisteredGroup } from "./types";
import { useGroupImperativeHandle } from "./useGroupImperativeHandle";
import { useResizePreviews } from "./useResizePreviews";

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
  resizePreviewMode = "panel",
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

  const onLayoutChangedStable = useStableCallback(
    (layout: Layout, isUserInteraction: boolean) => {
      if (layoutsEqual(prevLayoutRef.current.onLayoutChanged, layout)) {
        // Memoize callback
        return;
      }

      prevLayoutRef.current.onLayoutChanged = layout;
      onLayoutChangedUnstable?.(layout, { isUserInteraction });
    }
  );

  const id = useId(idProp);

  const [overlay, setOverlay] = useState<SeparatorOverlayProps>();

  const previews = useResizePreviews({
    groupId: id,
    resizePreviewMode
  });

  const elementRef = useRef<HTMLDivElement | null>(null);

  const [panelOrSeparatorChangeSigil, forceUpdate] = useForceUpdate();

  const inMemoryValuesRef = useRef<{
    lastExpandedPanelSizes: { [panelIds: string]: number };
    layouts: { [panelIds: string]: Layout };
    panels: RegisteredPanel[];
    separators: RegisteredSeparator[];
  }>({
    lastExpandedPanelSizes: {},
    layouts: {},
    panels: [],
    separators: []
  });

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  useGroupImperativeHandle(id, groupRef);

  // TRICKY Don't read for state; it will always lag behind by one tick
  const getPanelStyles = useStableCallback(
    (groupId: string, panelId: string) => {
      const groupState = getMountedGroupState(groupId);
      if (groupState) {
        return {
          flexGrow: groupState.layout[panelId] ?? 1
        } satisfies CSSProperties;
      }

      // This is unexpected except for the initial mount (before the group has registered with the global store)
      if (defaultLayout?.[panelId]) {
        return {
          flexGrow: defaultLayout?.[panelId]
        } satisfies CSSProperties;
      }
    }
  );

  const stableProps = useStableObject({
    defaultLayout,
    disableCursor,
    resizeTargetMinimumSize
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
      registerOverlay: (props: SeparatorOverlayProps) => {
        setOverlay(props);

        return () => {
          setOverlay(undefined);
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
      updatePanelProps: (
        panelId: string,
        { disabled }: { disabled: boolean | undefined }
      ) => {
        const inMemoryValues = inMemoryValuesRef.current;
        const panel = inMemoryValues.panels.find(
          (current) => current.id === panelId
        );
        if (panel) {
          panel.panelConstraints.disabled = disabled;
        }

        const group = getRegisteredGroup(id);
        const groupState = getMountedGroupState(id);
        if (group && groupState) {
          updateMountedGroup(group, {
            ...groupState,
            derivedPanelConstraints: calculatePanelConstraints(group)
          });
        }
      },
      updateSeparatorProps: (
        separatorId: string,
        {
          disabled,
          disableDoubleClick
        }: {
          disabled: boolean | undefined;
          disableDoubleClick: boolean | undefined;
        }
      ) => {
        const inMemoryValues = inMemoryValuesRef.current;
        const separator = inMemoryValues.separators.find(
          (current) => current.id === separatorId
        );
        if (separator) {
          separator.disabled = disabled;
          separator.disableDoubleClick = disableDoubleClick;
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
      disabled: !!disabled,
      element,
      id,
      mutableState: {
        defaultLayout: preSortedDefaultLayout,
        disableCursor: !!stableProps.disableCursor,
        expandedPanelSizes: inMemoryValuesRef.current.lastExpandedPanelSizes,
        layouts: inMemoryValuesRef.current.layouts
      },
      orientation,
      panels: inMemoryValues.panels,
      resizePreviewMode,
      get resizeTargetMinimumSize() {
        return stableProps.resizeTargetMinimumSize;
      },
      separators: inMemoryValues.separators
    };

    registeredGroupRef.current = group;

    const unmountGroup = mountGroup(group);

    const { defaultLayoutDeferred, derivedPanelConstraints, layout } =
      getMountedGroupState(group.id, true);

    if (!defaultLayoutDeferred && derivedPanelConstraints.length > 0) {
      onLayoutChangeStable(layout);
      // Initial mount is not a user interaction (#716).
      onLayoutChangedStable(layout, false);
    }

    const removeChangeEventListener = subscribeToMountedGroup(id, (event) => {
      const { defaultLayoutDeferred, derivedPanelConstraints, layout } =
        event.next;

      if (defaultLayoutDeferred || derivedPanelConstraints.length === 0) {
        // This indicates that the Group has not finished mounting yet
        // Likely because it has been rendered inside of a hidden DOM subtree
        // Ignore layouts in this case because they will not have been validated
        return;
      }

      recordGroupLayoutChange({
        derivedPanelConstraints,
        group,
        layout,
        prevLayout: event.prev?.layout
      });

      // Lastly notify layout-change(d) handlers of the update
      const interactionState = getInteractionState();
      const isCompleted =
        interactionState.state !== "active" ||
        !interactionState.hitRegions.some((region) => region.group === group);
      onLayoutChangeStable(layout);
      if (isCompleted) {
        onLayoutChangedStable(layout, event.isUserInteraction);
      }
    });

    return () => {
      registeredGroupRef.current = null;

      unmountGroup();
      removeChangeEventListener();
    };
  }, [
    disabled,
    id,
    onLayoutChangedStable,
    onLayoutChangeStable,
    orientation,
    panelOrSeparatorChangeSigil,
    resizePreviewMode,
    stableProps
  ]);

  // Not all props require re-registering the group;
  // Some can be updated after the group has been registered
  useEffect(() => {
    const registeredGroup = registeredGroupRef.current;
    if (registeredGroup) {
      registeredGroup.mutableState.defaultLayout = defaultLayout;
      registeredGroup.mutableState.disableCursor = !!disableCursor;
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
          position: resizePreviewMode === "separator" ? "relative" : undefined,

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
        {previews.map((preview) => (
          <ResizePreview
            key={preview.key}
            overlay={overlay}
            preview={preview}
          />
        ))}
      </div>
    </GroupContext.Provider>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Group.displayName = "Group";
