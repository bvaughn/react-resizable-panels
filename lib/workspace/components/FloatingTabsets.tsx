import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject
} from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import {
  FLOATING_GESTURE_ATTRIBUTE,
  FLOATING_RESIZE_CURSORS,
  type FloatingResizeEdge
} from "../hooks/useFloatingTabsetGesture";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { raiseFloatingTabset } from "../models/raiseFloatingTabset";
import type { FloatingTabsetNode } from "../types";
import { clampFloatingPosition } from "../utils/clampFloatingPosition";
import { getFloatingTabsetHeaderBox } from "../utils/getFloatingTabsetHeaderBox";
import { TabsetSlot } from "./TabsetSlot";

type LayoutBox = { height: number; left: number; top: number; width: number };

const RESIZE_EDGES: FloatingResizeEdge[] = [
  "top",
  "right",
  "bottom",
  "left",
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left"
];

// Resize handles straddle the tabset's edges (so they're easy to grab), with larger squares at the corners
const HANDLE_THICKNESS = 8;
const CORNER_SIZE = 12;

function FloatingTabsetsComponent({
  floating,
  layoutElementRef
}: {
  floating: FloatingTabsetNode[];
  layoutElementRef: RefObject<HTMLElement | null>;
}) {
  // The layer covers the layout (within the root element's padding), which floating tabsets are positioned relative to
  const [layoutBox, setLayoutBox] = useState<LayoutBox | null>(null);
  useIsomorphicLayoutEffect(() => {
    const layoutElement = layoutElementRef.current;
    if (!layoutElement) {
      return;
    }

    // Measured in layout pixels (like the tabsets' positions), relative to the root element (which positions the layer)
    const measure = () =>
      setLayoutBox((prev) => {
        const next = {
          height: layoutElement.offsetHeight,
          left: layoutElement.offsetLeft,
          top: layoutElement.offsetTop,
          width: layoutElement.offsetWidth
        };

        return prev &&
          prev.height === next.height &&
          prev.left === next.left &&
          prev.top === next.top &&
          prev.width === next.width
          ? prev
          : next;
      });
    measure();

    const ResizeObserver =
      layoutElement.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserver) {
      // The root element is observed too, since its padding moves the layout
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(layoutElement);
      if (layoutElement.parentElement) {
        resizeObserver.observe(layoutElement.parentElement);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [layoutElementRef]);

  // Tabsets are stacked by their order in the model (see raiseFloatingTabset), but rendered in a stable order,
  // since moving an element within the document (e.g. to raise it) would interrupt pointer capture (and reload iframes)
  const orderRef = useRef<string[]>([]);
  const ids = floating.map(({ id }) => id);
  const order = [
    ...orderRef.current.filter((id) => ids.includes(id)),
    ...ids.filter((id) => !orderRef.current.includes(id))
  ];
  orderRef.current = order;

  return (
    <div
      data-workspace-floating
      style={{
        // Floating tabsets stay within the workspace (e.g. the rest of one moved below its bottom edge isn't shown over the page beneath it)
        overflow: "hidden",
        pointerEvents: "none",
        position: "absolute",
        zIndex: 1,
        ...(layoutBox
          ? {
              height: layoutBox.height,
              left: layoutBox.left,
              top: layoutBox.top,
              width: layoutBox.width
            }
          : { inset: 0 })
      }}
    >
      {order.map((id) => {
        const index = ids.indexOf(id);

        return (
          <FloatingTabset
            key={id}
            layoutBox={layoutBox}
            stackIndex={index}
            tabset={floating[index]}
          />
        );
      })}
    </div>
  );
}

function FloatingTabset({
  layoutBox,
  stackIndex,
  tabset
}: {
  layoutBox: LayoutBox | null;
  stackIndex: number;
  tabset: FloatingTabsetNode;
}) {
  const {
    classNames,
    disabled,
    startFloatingGesture,
    styles,
    tabPlacement: defaultTabPlacement,
    updateModel
  } = useWorkspaceContext("FloatingTabset");

  const isMoveDisabled = disabled || !!tabset.disableDrag;

  // A collapsed tabset is only as large as its header across it (e.g. as tall as its tabs, when they're placed on top), so it can only be resized along its header;
  // it keeps its size in the model, to expand to
  const isCollapsed = !!tabset.collapsed;
  const tabPlacement = tabset.tabPlacement ?? defaultTabPlacement;
  const isHeaderVertical = tabPlacement === "left" || tabPlacement === "right";
  const resizeEdges = isCollapsed
    ? RESIZE_EDGES.filter((edge) =>
        isHeaderVertical
          ? edge === "top" || edge === "bottom"
          : edge === "left" || edge === "right"
      )
    : RESIZE_EDGES;

  // The header is kept within the layout, so that it can be dragged back (see clampFloatingPosition);
  // the model's position isn't changed, so it's shown there again once that fits (e.g. when the workspace is made larger again).
  // The element is positioned directly (once its header can be measured), before the browser paints
  const elementRef = useRef<HTMLDivElement | null>(null);
  // This runs after every render (rather than when the position, size, or layout change), since the header can change on its own
  // (e.g. when the tab placement changes, or its tabs wrap), which can leave it outside of the layout
  const layoutWidth = layoutBox?.width;
  const layoutHeight = layoutBox?.height;
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || layoutWidth === undefined || layoutHeight === undefined) {
      return;
    }

    // A gesture positions the element directly; renders during it (e.g. raising the tabset) shouldn't move it back
    if (element.hasAttribute(FLOATING_GESTURE_ATTRIBUTE)) {
      return;
    }

    const header = getFloatingTabsetHeaderBox(element);
    if (!header) {
      return;
    }

    const { x, y } = clampFloatingPosition(
      { x: tabset.x, y: tabset.y },
      header,
      { height: layoutHeight, width: layoutWidth }
    );
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });

  // Pressing a tabset that's behind another brings it to the front (even when the workspace is disabled);
  // the listener is added to the element (rather than with React), since tab content is rendered through portals that aren't within it in React's tree
  const tabsetId = tabset.id;
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const raise = () =>
      updateModel("raise", true, (prev) => raiseFloatingTabset(prev, tabsetId));
    element.addEventListener("pointerdown", raise, true);

    return () => {
      element.removeEventListener("pointerdown", raise, true);
    };
  }, [tabsetId, updateModel]);

  return (
    <div
      className={classNames?.floatingTabset}
      data-floating-tabset={tabset.id}
      data-tabset-collapsed={isCollapsed || undefined}
      ref={elementRef}
      style={{
        ...styles?.floatingTabset,
        height: isCollapsed && !isHeaderVertical ? "auto" : tabset.height,
        left: tabset.x,
        pointerEvents: "auto",
        position: "absolute",
        top: tabset.y,
        width: isCollapsed && isHeaderVertical ? "auto" : tabset.width,
        zIndex: stackIndex + 1
      }}
    >
      <TabsetSlot tabset={tabset} />
      {!isMoveDisabled &&
        resizeEdges.map((edge) => (
          <div
            className={classNames?.floatingResizeHandle}
            data-floating-resize-handle={edge}
            key={edge}
            onPointerDown={(event) => {
              if (event.button === 0) {
                startFloatingGesture(tabset.id, edge, event);
              }
            }}
            style={{
              ...styles?.floatingResizeHandle,
              ...getHandleStyle(edge)
            }}
          />
        ))}
    </div>
  );
}

function getHandleStyle(edge: FloatingResizeEdge): CSSProperties {
  const offset = -HANDLE_THICKNESS / 2;
  const style: CSSProperties = {
    cursor: FLOATING_RESIZE_CURSORS[edge],
    position: "absolute",
    touchAction: "none"
  };

  if (edge.includes("-")) {
    // Corners are above the edges they join
    return {
      ...style,
      height: CORNER_SIZE,
      width: CORNER_SIZE,
      zIndex: 1,
      [edge.startsWith("top") ? "top" : "bottom"]: offset,
      [edge.endsWith("left") ? "left" : "right"]: offset
    };
  }

  return edge === "top" || edge === "bottom"
    ? { ...style, [edge]: offset, height: HANDLE_THICKNESS, left: 0, right: 0 }
    : { ...style, [edge]: offset, bottom: 0, top: 0, width: HANDLE_THICKNESS };
}

/**
 * Renders the workspace's floating tabsets (see WorkspaceModel.floating) in a layer above its layout (and above a maximized tabset),
 * positioned relative to the layout.
 */
export const FloatingTabsets = /* @__PURE__ */ Object.assign(
  FloatingTabsetsComponent,
  { displayName: "Workspace.FloatingTabsets" }
);
