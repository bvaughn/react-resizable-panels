import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode
} from "react";
import { getClientScale } from "../../global/dom/getClientScale";
import type { Orientation } from "../../global/types";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { createAutoScroller } from "../utils/createAutoScroller";
import { getScrollContainer } from "../utils/getScrollContainer";
import { isRightToLeft } from "../utils/isRightToLeft";

// Default thickness (in pixels) of the handle, which is transparent (see WorkspaceClassNames.growHandle)
const HANDLE_SIZE = 6;

// Distances (in pixels) the arrow keys resize by, without and with the Shift key
const KEYBOARD_STEP = 10;
const KEYBOARD_STEP_LARGE = 50;

function GrowHandleComponent({
  children,
  controlsId,
  getSize,
  maxSize,
  minSize,
  onCommit,
  onPreview,
  orientation,
  valueNow
}: {
  children?: ReactNode;
  /** The id of the element the handle resizes */
  controlsId: string;
  /** The current size (in layout pixels) of the row (or column) the handle resizes */
  getSize: () => number;
  maxSize: number;
  minSize: number;
  onCommit: (size: number) => void;
  onPreview: (size: number | null) => void;
  /** Orientation of the split the handle is in */
  orientation: Orientation;
  /** The row's size in pixels, if it's known (its size if that is in pixels, otherwise as last measured) */
  valueNow: number | undefined;
}) {
  const { classNames, disabled, styles } = useWorkspaceContext("GrowHandle");
  const isVertical = orientation === "vertical";

  const clamp = (size: number) =>
    Math.round(Math.max(minSize, Math.min(maxSize, size)));

  // The drag in progress, if any
  // Shown (as data-active) while the handle is dragged
  const [isActive, setIsActive] = useState(false);

  const dragRef = useRef<{
    autoScroller: ReturnType<typeof createAutoScroller>;
    // Growth the scroll position hasn't caught up with yet: when there's nothing further to scroll, the row grows first (see onBlocked)
    pendingGrowth: number;
    lastScroll: number;
    // What the workspace scrolls within, and how far it was scrolled when the drag started
    container: Element | null;
    lastPosition: number;
    lastSize: number;
    removeScrollListener: () => void;
    startScroll: number;
    // Rows (or columns) are laid out from the right in right-to-left text, so the pointer moves the other way
    isReversed: boolean;
    pointerId: number;
    scale: number;
    startPosition: number;
    startSize: number;
  } | null>(null);

  // A drag ends (without resizing) if the handle is disabled, or removed (e.g. its row is collapsed), mid-drag
  const onPreviewRef = useRef(onPreview);
  useEffect(() => {
    onPreviewRef.current = onPreview;
  });
  // (Defined below; read when these effects run)
  const endDragRef = useRef<() => unknown>(() => {});
  useEffect(() => {
    if (disabled && dragRef.current) {
      endDragRef.current();
      setIsActive(false);
      onPreviewRef.current(null);
    }
  }, [disabled]);
  useEffect(
    () => () => {
      if (dragRef.current) {
        endDragRef.current();
        onPreviewRef.current(null);
      }
    },
    []
  );

  // Scrolling (by the auto-scroller, or the user) happens outside of React events, so it reads the latest props
  const clampRef = useRef(clamp);
  useEffect(() => {
    clampRef.current = clamp;
  });

  const getScrollPosition = (container: Element | null) => {
    if (!container) {
      return 0;
    }
    const ownerWindow = container.ownerDocument.defaultView;
    if (container === container.ownerDocument.scrollingElement && ownerWindow) {
      return isVertical ? ownerWindow.scrollY : ownerWindow.scrollX;
    }
    return isVertical ? container.scrollTop : container.scrollLeft;
  };

  // The row grows by how far the pointer moved, and by how far what it's scrolled within scrolled (so the handle stays under the pointer)
  const updateSize = () => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    // Scrolling catches up with growth that happened first (when there was nothing further to scroll)
    const scroll = getScrollPosition(drag.container);
    const scrolled = scroll - drag.lastScroll;
    drag.lastScroll = scroll;
    if (
      drag.pendingGrowth !== 0 &&
      Math.sign(scrolled) === Math.sign(drag.pendingGrowth)
    ) {
      const caughtUp =
        Math.sign(scrolled) *
        Math.min(Math.abs(scrolled), Math.abs(drag.pendingGrowth));
      drag.pendingGrowth -= caughtUp;
    }

    const delta =
      (drag.lastPosition - drag.startPosition) / drag.scale +
      (scroll - drag.startScroll) +
      drag.pendingGrowth;
    drag.lastSize = clampRef.current(
      drag.startSize + (drag.isReversed ? -delta : delta)
    );
    onPreviewRef.current(drag.lastSize);
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (drag) {
      drag.autoScroller.stop();
      drag.removeScrollListener();
      dragRef.current = null;
    }
    return drag;
  };
  useEffect(() => {
    endDragRef.current = endDrag;
  });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsActive(true);

    const handle = event.currentTarget;
    const orientation = isVertical ? "vertical" : "horizontal";
    const container = getScrollContainer(handle, orientation);

    // Scrolled while the pointer is near the edge of what the workspace scrolls within, so the row can grow past what's visible
    const autoScroller = createAutoScroller(
      handle,
      orientation,
      updateSize,
      // At the end of what can be scrolled (e.g. the row is at the bottom of it), the row grows first, so there's more to scroll
      (distance) => {
        const drag = dragRef.current;
        if (drag && distance * (drag.isReversed ? -1 : 1) > 0) {
          drag.pendingGrowth += distance;
          updateSize();
        }
      }
    );
    // Scrolling by the user (e.g. with a wheel) mid-drag also moves the handle
    const ownerDocument = handle.ownerDocument;
    ownerDocument.addEventListener("scroll", updateSize, {
      capture: true,
      passive: true
    });

    const startSize = getSize();
    dragRef.current = {
      autoScroller,
      container,
      lastPosition: isVertical ? event.clientY : event.clientX,
      removeScrollListener: () =>
        ownerDocument.removeEventListener("scroll", updateSize, {
          capture: true
        }),
      lastScroll: getScrollPosition(container),
      pendingGrowth: 0,
      startScroll: getScrollPosition(container),
      isReversed:
        !isVertical &&
        isRightToLeft(event.currentTarget.closest("[data-workspace]")),
      lastSize: startSize,
      pointerId: event.pointerId,
      // Pointer positions are in screen pixels, sizes in layout pixels (they differ within a scaled ancestor, e.g. CSS zoom)
      scale: getClientScale(
        event.currentTarget,
        isVertical ? "vertical" : "horizontal"
      ),
      startPosition: isVertical ? event.clientY : event.clientX,
      startSize
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    // Disabling the workspace mid-drag ends the drag without resizing
    if (disabled) {
      endDrag();
      setIsActive(false);
      onPreview(null);
      return;
    }

    drag.lastPosition = isVertical ? event.clientY : event.clientX;
    drag.autoScroller.update(event.clientX, event.clientY);
    updateSize();
  };

  const onPointerEnd = (
    event: PointerEvent<HTMLDivElement>,
    shouldCommit: boolean
  ) => {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    const drag = endDrag()!;
    setIsActive(false);
    onPreview(null);
    if (shouldCommit && !disabled && drag.lastSize !== drag.startSize) {
      onCommit(drag.lastSize);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
    const isReversed =
      !isVertical &&
      isRightToLeft(event.currentTarget.closest("[data-workspace]"));
    const growKey = isVertical
      ? "ArrowDown"
      : isReversed
        ? "ArrowLeft"
        : "ArrowRight";
    const shrinkKey = isVertical
      ? "ArrowUp"
      : isReversed
        ? "ArrowRight"
        : "ArrowLeft";
    let size: number | undefined;
    switch (event.key) {
      case growKey: {
        size = getSize() + step;
        break;
      }
      case shrinkKey: {
        size = getSize() - step;
        break;
      }
      case "Home": {
        size = minSize;
        break;
      }
      case "End": {
        if (Number.isFinite(maxSize)) {
          size = maxSize;
        }
        break;
      }
    }

    if (size !== undefined) {
      event.preventDefault();
      onCommit(clamp(size));
    }
  };

  return (
    <div
      aria-controls={controlsId}
      aria-disabled={disabled || undefined}
      // The handle lies across the split (e.g. a horizontal line between rows)
      aria-orientation={isVertical ? "horizontal" : "vertical"}
      aria-valuemax={Number.isFinite(maxSize) ? maxSize : undefined}
      aria-valuemin={minSize}
      aria-valuenow={valueNow !== undefined ? Math.round(valueNow) : undefined}
      aria-valuetext={
        valueNow !== undefined ? `${Math.round(valueNow)} pixels` : undefined
      }
      className={classNames?.growHandle}
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      data-grow-handle=""
      onKeyDown={onKeyDown}
      onLostPointerCapture={(event) => onPointerEnd(event, true)}
      onPointerCancel={(event) => onPointerEnd(event, false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => onPointerEnd(event, true)}
      role="separator"
      style={{
        // A default size, unless the application sizes the handle itself (which a class can't do over an inline style)
        ...(classNames?.growHandle || styles?.growHandle
          ? undefined
          : { [isVertical ? "height" : "width"]: HANDLE_SIZE }),
        cursor: disabled ? undefined : isVertical ? "row-resize" : "col-resize",
        flex: "none",
        touchAction: "none",
        ...styles?.growHandle
      }}
      tabIndex={disabled ? undefined : 0}
    >
      {children}
    </div>
  );
}

/**
 * The handle after the last row (or column) of a workspace with the `growDirection` prop, which resizes that row, and the workspace with it
 * (unlike the separators between rows, which move space between the rows beside them).
 */
export const GrowHandle = /* @__PURE__ */ Object.assign(GrowHandleComponent, {
  displayName: "Workspace.GrowHandle"
});
