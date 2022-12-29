import {
  createElement,
  CSSProperties,
  ElementType,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PanelGroupContext } from "./PanelContexts";
import { Direction, PanelData, ResizeEvent } from "./types";
import { loadPanelLayout, savePanelGroupLayout } from "./utils/serialization";
import { getDragOffset, getMovement } from "./utils/coordinates";
import {
  adjustByDelta,
  getFlexGrow,
  getPanelGroup,
  getResizeHandlePanelIds,
  panelsMapToSortedArray,
} from "./utils/group";
import { useWindowSplitterPanelGroupBehavior } from "./hooks/useWindowSplitterBehavior";
import useUniqueId from "./hooks/useUniqueId";

export type CommittedValues = {
  direction: Direction;
  panels: Map<string, PanelData>;
  sizes: number[];
};

export type PanelDataMap = Map<string, PanelData>;

// TODO
// Within an active drag, remember original positions to refine more easily on expand.
// Look at what the Chrome devtools Sources does.

export type PanelGroupProps = {
  autoSaveId?: string;
  children?: ReactNode;
  className?: string;
  direction: Direction;
  id?: string | null;
  style?: CSSProperties;
  tagName?: ElementType;
};

export default function PanelGroup({
  autoSaveId,
  children = null,
  className: classNameFromProps = "",
  direction,
  id: idFromProps = null,
  style: styleFromProps = {},
  tagName: Type = "div",
}: PanelGroupProps) {
  const groupId = useUniqueId(idFromProps);

  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);
  const [panels, setPanels] = useState<PanelDataMap>(new Map());

  // 0-1 values representing the relative size of each panel.
  const [sizes, setSizes] = useState<number[]>([]);

  const dragOffsetRef = useRef<number>(0);

  // Store committed values to avoid unnecessarily re-running memoization/effects functions.
  const committedValuesRef = useRef<CommittedValues>({
    direction,
    panels,
    sizes,
  });

  useLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.panels = panels;
    committedValuesRef.current.sizes = sizes;
  });

  useWindowSplitterPanelGroupBehavior({
    committedValuesRef,
    groupId,
    panels,
    setSizes,
    sizes,
  });

  // Once all panels have registered themselves,
  // Compute the initial sizes based on default weights.
  // This assumes that panels register during initial mount (no conditional rendering)!
  useLayoutEffect(() => {
    const sizes = committedValuesRef.current.sizes;
    if (sizes.length === panels.size) {
      return;
    }

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let defaultSizes: number[] | undefined = undefined;
    if (autoSaveId) {
      const panelsArray = panelsMapToSortedArray(panels);
      defaultSizes = loadPanelLayout(autoSaveId, panelsArray);
    }

    if (defaultSizes != null) {
      setSizes(defaultSizes);
    } else {
      const panelsArray = panelsMapToSortedArray(panels);

      let panelsWithNullDefaultSize = 0;
      let totalDefaultSize = 0;
      let totalMinSize = 0;

      // TODO
      // Implicit default size calculations below do not account for inferred min/max size values.
      // e.g. if Panel A has a maxSize of 40 then Panels A and B can't both have an implicit default size of 50.
      // For now, these logic edge cases are left to the user to handle via props.

      panelsArray.forEach((panel) => {
        totalMinSize += panel.minSize;

        if (panel.defaultSize === null) {
          panelsWithNullDefaultSize++;
        } else {
          totalDefaultSize += panel.defaultSize;
        }
      });

      if (totalDefaultSize > 100) {
        throw new Error(
          `The sum of the defaultSize of all panels in a group cannot exceed 100.`
        );
      } else if (totalMinSize > 100) {
        throw new Error(
          `The sum of the minSize of all panels in a group cannot exceed 100.`
        );
      }

      setSizes(
        panelsArray.map((panel) => {
          if (panel.defaultSize === null) {
            return (100 - totalDefaultSize) / panelsWithNullDefaultSize;
          }

          return panel.defaultSize;
        })
      );
    }
  }, [autoSaveId, panels]);

  useEffect(() => {
    // If this panel has been configured to persist sizing information, save sizes to local storage.
    if (autoSaveId) {
      if (sizes.length === 0 || sizes.length !== panels.size) {
        return;
      }

      const panelsArray = panelsMapToSortedArray(panels);
      savePanelGroupLayout(autoSaveId, panelsArray, sizes);
    }
  }, [autoSaveId, panels, sizes]);

  const getPanelStyle = useCallback(
    (id: string): CSSProperties => {
      const { panels } = committedValuesRef.current;

      const flexGrow = getFlexGrow(panels, id, sizes);

      return {
        flexBasis: 0,
        flexGrow,
        flexShrink: 1,

        // Without this, Panel sizes may be unintentionally overridden by their content.
        overflow: "hidden",
      };
    },
    [direction, sizes]
  );

  const registerPanel = useCallback((id: string, panel: PanelData) => {
    setPanels((prevPanels) => {
      if (prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.set(id, panel);

      return nextPanels;
    });
  }, []);

  const registerResizeHandle = useCallback(
    (handleId: string) => {
      const resizeHandler = (event: ResizeEvent) => {
        event.preventDefault();

        const {
          direction,
          panels,
          sizes: prevSizes,
        } = committedValuesRef.current;

        const panelsArray = panelsMapToSortedArray(panels);

        const [idBefore, idAfter] = getResizeHandlePanelIds(
          groupId,
          handleId,
          panelsArray
        );
        if (idBefore == null || idAfter == null) {
          return;
        }

        const movement = getMovement(
          event,
          groupId,
          handleId,
          direction,
          dragOffsetRef.current
        );
        if (movement === 0) {
          return;
        }

        const groupElement = getPanelGroup(groupId);
        const rect = groupElement.getBoundingClientRect();
        const isHorizontal = direction === "horizontal";
        const size = isHorizontal ? rect.width : rect.height;
        const delta = (movement / size) * 100;

        const nextSizes = adjustByDelta(
          panels,
          idBefore,
          idAfter,
          delta,
          prevSizes
        );
        if (prevSizes !== nextSizes) {
          setSizes(nextSizes);
        }
      };

      return resizeHandler;
    },
    [groupId]
  );

  const unregisterPanel = useCallback((id: string) => {
    setPanels((prevPanels) => {
      if (!prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.delete(id);

      return nextPanels;
    });
  }, []);

  const context = useMemo(
    () => ({
      activeHandleId,
      direction,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      startDragging: (id: string, event: ResizeEvent) => {
        setActiveHandleId(id);

        dragOffsetRef.current = getDragOffset(event, id, direction);
      },
      stopDragging: () => {
        setActiveHandleId(null);
      },
      unregisterPanel,
    }),
    [
      activeHandleId,
      direction,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      unregisterPanel,
    ]
  );

  const style: CSSProperties = {
    display: "flex",
    flexDirection: direction === "horizontal" ? "row" : "column",
    height: "100%",
    overflow: "hidden",
    width: "100%",
  };

  return createElement(PanelGroupContext.Provider, {
    children: createElement(Type, {
      children,
      className: classNameFromProps,
      "data-panel-group-direction": direction,
      "data-panel-group-id": groupId,
      style: { ...style, ...styleFromProps },
    }),
    value: context,
  });
}

// Workaround for Parcel scope hoisting (which renames objects/functions).
// Casting to :any is required to avoid corrupting the generated TypeScript types.
// See github.com/parcel-bundler/parcel/issues/8724
(PanelGroup as any).displayName = "PanelGroup";
