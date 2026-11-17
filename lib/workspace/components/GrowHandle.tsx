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
  /** Orientation of the split the handle is in */
  orientation: Orientation;
  /** The row's size in pixels, if it's known (its size if that is in pixels, otherwise as last measured) */
  valueNow: number | undefined;
}) {
  const { classNames, disabled, styles } = useWorkspaceContext("GrowHandle");
  const isVertical = orientation === "vertical";

  const clamp = (size: number) =>
    Math.round(Math.max(minSize, Math.min(maxSize, size)));

  // While the handle is dragged, only the handle moves (shown as data-active): the row, and the workspace with it,
  // are resized when the pointer is released (like a Group's "separator" resizePreviewMode).
  // Resizing the workspace mid-drag would also change what it scrolls within (e.g. a shorter workspace scrolled to its end
  // scrolls back), which would move the handle away from the pointer.
  // The moved handle is a translucent copy with fixed positioning, so that it's shown even beyond the edge of what the workspace scrolls within
  // (which clips its content); the handle itself stays where it is (like a Group's separators do while they're previewed)
  const [preview, setPreview] = useState<{
    // Where the handle was (in the viewport, in layout pixels) when the drag started
    rect: { height: number; left: number; top: number; width: number };
    // How far (in layout pixels) the handle is moved from there, along the split
    offset: number;
    size: number;
  } | null>(null);

  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    // Rows (or columns) are laid out from the right in right-to-left text, so the pointer moves the other way
    isReversed: boolean;
    lastSize: number;
    pointerId: number;
    rect: { height: number; left: number; top: number; width: number };
    scale: number;
    startPosition: number;
    startSize: number;
  } | null>(null);

  // A drag ends (without resizing) if the handle is disabled mid-drag; a handle that's removed (e.g. its row is collapsed) has no drag to end
  useEffect(() => {
    if (disabled && dragRef.current) {
      dragRef.current = null;
      setPreview(null);
    }
  }, [disabled]);

  // The preview is fixed at the viewport position where the drag started, and sizes are from the pointer's movement,
  // so a drag ends (without resizing) if anything scrolls during it (e.g. with the wheel)
  const isDragging = preview !== null;
  useEffect(() => {
    if (!isDragging || !handleRef.current) {
      return;
    }

    const ownerDocument = handleRef.current.ownerDocument;
    const onScroll = (event: Event) => {
      // Only scrolls that move the handle count (not those of unrelated elements, e.g. within a tab's content);
      // checked without instanceof, since the target may be from another window
      const target = event.target as Partial<Node> | null;
      const movesHandle =
        target === ownerDocument ||
        (!!target &&
          target.nodeType === 1 &&
          (target as Element).contains(handleRef.current));
      if (!movesHandle) {
        return;
      }

      dragRef.current = null;
      setPreview(null);
    };
    ownerDocument.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true
    });
    return () => ownerDocument.removeEventListener("scroll", onScroll, true);
  }, [isDragging]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startSize = getSize();
    // Fixed positions are in layout pixels too (e.g. within a CSS zoom)
    const scaleX = getClientScale(event.currentTarget, "horizontal");
    const scaleY = getClientScale(event.currentTarget, "vertical");
    const clientRect = event.currentTarget.getBoundingClientRect();
    const rect = {
      height: clientRect.height / scaleY,
      left: clientRect.left / scaleX,
      top: clientRect.top / scaleY,
      width: clientRect.width / scaleX
    };
    dragRef.current = {
      isReversed:
        !isVertical &&
        isRightToLeft(event.currentTarget.closest("[data-workspace]")),
      lastSize: startSize,
      pointerId: event.pointerId,
      rect,
      // Pointer positions are in screen pixels, sizes in layout pixels (they differ within a scaled ancestor, e.g. CSS zoom)
      scale: isVertical ? scaleY : scaleX,
      startPosition: isVertical ? event.clientY : event.clientX,
      startSize
    };
    setPreview({ offset: 0, rect, size: startSize });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    // Disabling the workspace mid-drag ends the drag without resizing
    if (disabled) {
      dragRef.current = null;
      setPreview(null);
      return;
    }

    // The handle follows the pointer, within the row's minimum and maximum sizes
    const position = isVertical ? event.clientY : event.clientX;
    const delta = (position - drag.startPosition) / drag.scale;
    drag.lastSize = clamp(drag.startSize + (drag.isReversed ? -delta : delta));
    const growth = drag.lastSize - drag.startSize;
    setPreview({
      offset: drag.isReversed ? -growth : growth,
      rect: drag.rect,
      size: drag.lastSize
    });
  };

  const onPointerEnd = (
    event: PointerEvent<HTMLDivElement>,
    shouldCommit: boolean
  ) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setPreview(null);
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

  // The size the handle would resize the row to, while it's dragged
  const shownValue = preview?.size ?? valueNow;

  // The handle's own styles (also used by the copy that's shown while it's dragged)
  const handleStyle = {
    // A default size, unless the application sizes the handle itself (which a class can't do over an inline style)
    ...(classNames?.growHandle || styles?.growHandle
      ? undefined
      : { [isVertical ? "height" : "width"]: HANDLE_SIZE }),
    cursor: disabled ? undefined : isVertical ? "row-resize" : "col-resize",
    flex: "none",
    touchAction: "none",
    ...styles?.growHandle
  };

  return (
    <>
      <div
        aria-controls={controlsId}
        aria-disabled={disabled || undefined}
        // The handle lies across the split (e.g. a horizontal line between rows)
        aria-orientation={isVertical ? "horizontal" : "vertical"}
        aria-valuemax={Number.isFinite(maxSize) ? maxSize : undefined}
        aria-valuemin={minSize}
        aria-valuenow={
          shownValue !== undefined ? Math.round(shownValue) : undefined
        }
        aria-valuetext={
          shownValue !== undefined
            ? `${Math.round(shownValue)} pixels`
            : undefined
        }
        className={classNames?.growHandle}
        data-active={preview !== null || undefined}
        data-disabled={disabled || undefined}
        data-grow-handle=""
        ref={handleRef}
        onKeyDown={onKeyDown}
        onLostPointerCapture={(event) => onPointerEnd(event, true)}
        onPointerCancel={(event) => onPointerEnd(event, false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => onPointerEnd(event, true)}
        role="separator"
        // While it's dragged, the handle keeps its place (and receives the pointer's events), and the copy below shows where the row would end
        style={handleStyle}
        tabIndex={disabled ? undefined : 0}
      >
        {children}
      </div>
      {preview !== null && (
        <div
          aria-hidden
          className={classNames?.growHandle}
          data-active
          data-grow-handle-preview=""
          style={{
            ...handleStyle,
            boxSizing: "border-box",
            height: preview.rect.height,
            left: preview.rect.left + (isVertical ? 0 : preview.offset),
            margin: 0,
            // Translucent, like a Group's separator previews (see SeparatorClone), so it's told apart from the handle
            opacity: 0.65,
            pointerEvents: "none",
            position: "fixed",
            top: preview.rect.top + (isVertical ? preview.offset : 0),
            width: preview.rect.width,
            zIndex: 1
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}

/**
 * The handle after the last row (or column) of a workspace with the `growDirection` prop, which resizes that row, and the workspace with it
 * (unlike the separators between rows, which move space between the rows beside them).
 * While it's dragged, only the handle moves (a copy of it is shown with fixed positioning, so it isn't clipped by what the workspace scrolls within);
 * the row is resized when the pointer is released.
 */
export const GrowHandle = /* @__PURE__ */ Object.assign(GrowHandleComponent, {
  displayName: "Workspace.GrowHandle"
});
