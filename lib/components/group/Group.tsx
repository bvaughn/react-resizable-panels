import { useMemo, useState } from "react";
import { mountGroup } from "../../global/mountGroup";
import { eventEmitter, read } from "../../global/mutableState";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableCallback } from "../../hooks/useStableCallback";
import { POINTER_EVENTS_CSS_PROPERTY_NAME } from "../panel/constants";
import type { RegisteredPanel } from "../panel/types";
import type { RegisteredResizeHandle } from "../resize-handle/types";
import { getPanelSizeCssPropertyName } from "./getPanelSizeCssPropertyName";
import { GroupContext } from "./GroupContext";
import { RestoreSavedLayout } from "./RestoreSavedLayout";
import { sortByElementOffset } from "./sortByElementOffset";
import type { GroupProps, Layout, RegisteredGroup } from "./types";
import { useGroupImperativeHandle } from "./useGroupImperativeHandle";

// TODO Validate unique Panel and ResizeHandle ids
// TODO Warn if Group is autoSave and registered Panel(s) do not have ids
// TODO Should auto-save work by default with storage:InMemory (for conditional panels use case?)

/**
 * A Group wraps a set of resizable Panel components.
 * Group content can be resized _horizontally_ or _vertically_.
 *
 * For unit testing purposes, Group elements always include the following data attributes:
 *
 * ```html
 * <div data-group data-group-id="your-group-id">
 * ```
 */
export function Group({
  autoSave: autoSaveProp,
  children,
  className,
  direction = "horizontal",
  disableCursor,
  disabled,
  elementRef,
  groupRef,
  id: idProp,
  onLayoutChange: onLayoutChangeUnstable,
  storage,
  style
}: GroupProps) {
  let autoSave = !!autoSaveProp;
  if (autoSave && idProp === undefined) {
    autoSave = false;
    console.error('Auto-save Groups require an "id" prop');
  }

  const onLayoutChangeStable = useStableCallback((layout: Layout) => {
    onLayoutChangeUnstable?.(layout);
  });

  const id = useId(idProp);

  const [dragActive, setDragActive] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<Layout>({});
  const [panels, setPanels] = useState<RegisteredPanel[]>([]);
  const [resizeHandles, setResizeHandles] = useState<RegisteredResizeHandle[]>(
    []
  );

  const mergedRef = useMergedRefs(setElement, elementRef);

  useGroupImperativeHandle(id, groupRef);

  const context = useMemo(
    () => ({
      direction,
      id,
      registerPanel: (panel: RegisteredPanel) => {
        setPanels((prev) => sortByElementOffset(direction, [...prev, panel]));
        return () => {
          setPanels((prev) => prev.filter((current) => current !== panel));
        };
      },
      registerResizeHandle: (resizeHandle: RegisteredResizeHandle) => {
        setResizeHandles((prev) =>
          sortByElementOffset(direction, [...prev, resizeHandle])
        );
        return () => {
          setResizeHandles((prev) =>
            prev.filter((current) => current !== resizeHandle)
          );
        };
      }
    }),
    [direction, id]
  );

  // Register Group and child Panels/ResizeHandles with global state
  // Listen to global state for drag state related to this Group
  useIsomorphicLayoutEffect(() => {
    if (element !== null) {
      const group: RegisteredGroup = {
        autoSave,
        direction,
        disableCursor: !!disableCursor,
        disabled: !!disabled,
        element,
        id,
        panels,
        resizeHandles,
        storage
      };

      const unmountGroup = mountGroup(group);

      const globalState = read();
      const match = globalState.mountedGroups.get(group);
      if (match) {
        setLayout(match.layout);
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
          if (match) {
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
    autoSave,
    direction,
    disableCursor,
    disabled,
    element,
    id,
    onLayoutChangeStable,
    panels,
    resizeHandles,
    storage
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
      {autoSave && <RestoreSavedLayout autoSaveId={id} />}

      <div
        className={className}
        data-group
        data-group-id={id}
        data-group-direction={direction}
        ref={mergedRef}
        style={{
          ...style,
          ...cssVariables,
          display: "flex",
          flexDirection: direction === "horizontal" ? "row" : "column",
          flexWrap: "nowrap",
          overflow: "hidden"
        }}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}
