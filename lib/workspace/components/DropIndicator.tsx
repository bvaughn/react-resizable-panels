import { useRef, useState, type CSSProperties, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useDragState } from "../hooks/useDragState";
import type { WorkspaceModel } from "../types";
import { getWorkspaceEdgeShare } from "../utils/getWorkspaceEdgeShare";
import type { DragStore } from "../utils/createDragStore";
import type { TabsetElementRegistry } from "../utils/createTabsetElementRegistry";
import { isRightToLeft } from "../utils/isRightToLeft";
import { isSameDropIndicatorInsets } from "../utils/isSameDropIndicatorInsets";
import {
  measureDropIndicatorInsets,
  type DropIndicatorInsets
} from "../utils/measureDropIndicatorInsets";

function DropIndicatorComponent({
  className,
  dragStore,
  isCopy,
  layoutElementRef,
  model,
  style,
  tabsetElements
}: {
  className: string | undefined;
  dragStore: DragStore;
  /** Set while dropping would add a copy, which leaves the dragged tab (or tabset) where it is */
  isCopy: boolean;
  /** Contains the workspace's tabsets; drops at its edges are shown within it */
  layoutElementRef: RefObject<HTMLElement | null>;
  model: WorkspaceModel;
  style: CSSProperties | undefined;
  tabsetElements: TabsetElementRegistry;
}) {
  // Only the indicator re-renders when the drop target changes (see createDragStore)
  const dropTarget = useDragState(dragStore, (state) => state.dropTarget);
  const dragSource = useDragState(dragStore, (state) => state.dragSource);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Kept while the dragged tab isn't over a tabset's panels or an edge of the workspace (e.g. it's over a tab list, or between tabsets),
  // so that the indicator is animated from where it was to the next region
  const [insets, setInsets] = useState<DropIndicatorInsets | undefined>();

  const region =
    dropTarget && "region" in dropTarget ? dropTarget.region : undefined;
  const tabsetId =
    dropTarget && "tabsetId" in dropTarget ? dropTarget.tabsetId : undefined;
  const edge = dropTarget && "edge" in dropTarget ? dropTarget.edge : undefined;

  // Measured when the target or the model changes (the panels can be replaced or moved, e.g. by a maximized tabset),
  // and again if the layout changes during the drag (e.g. the window is resized);
  // only the indicator re-renders (before the browser paints), and only when its insets change
  useIsomorphicLayoutEffect(() => {
    const containerElement = containerRef.current;

    // Drops at an edge of the workspace are shown over the part of its layout that the tabset would fill
    const element = edge
      ? layoutElementRef.current
      : region && tabsetId
        ? tabsetElements.get(tabsetId)?.panels
        : undefined;
    const elementRegion = edge ?? region;
    if (!containerElement || !element || !elementRegion) {
      return;
    }

    const fraction = edge
      ? getWorkspaceEdgeShare(
          model,
          edge,
          // A copy leaves the dragged tab (or tabset) where it is, like a tab dragged in from another workspace (which is estimated)
          isCopy ? undefined : dragSource,
          isRightToLeft(layoutElementRef.current)
        )
      : undefined;

    const measure = () => {
      if (!element.isConnected) {
        return;
      }

      const next = measureDropIndicatorInsets(
        containerElement,
        element,
        elementRegion,
        fraction
      );
      setInsets((prev) =>
        isSameDropIndicatorInsets(prev, next) ? prev : next
      );
    };

    measure();

    const ResizeObserver =
      containerElement.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserver) {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(containerElement);
      resizeObserver.observe(element);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [
    dragSource,
    edge,
    isCopy,
    layoutElementRef,
    model,
    region,
    tabsetElements,
    tabsetId
  ]);

  // The container covers the workspace's root element (and a maximized tabset, which is rendered before it)
  return (
    <div
      ref={containerRef}
      style={{
        inset: 0,
        pointerEvents: "none",
        position: "absolute",
        zIndex: 1
      }}
    >
      <div
        className={className}
        data-drag-copy={isCopy || undefined}
        data-drop-indicator
        data-edge={edge}
        data-region={region}
        style={{
          ...style,
          ...insets,
          ...(!region && !edge && { opacity: 0 }),
          pointerEvents: "none",
          position: "absolute"
        }}
      />
    </div>
  );
}

/**
 * Shows where a dragged tab (or tabset) will be dropped within a tabset's panels (`data-region`),
 * or at an edge of the workspace (`data-edge`).
 *
 * ℹ️ It's rendered within the workspace's root element for the whole drag (rather than within each tabset's panels),
 * so that it can be animated between regions and tabsets.
 */
export const DropIndicator = /* @__PURE__ */ Object.assign(
  DropIndicatorComponent,
  {
    displayName: "Workspace.DropIndicator"
  }
);
