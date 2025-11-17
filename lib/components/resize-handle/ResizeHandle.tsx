import { useState } from "react";
import { eventEmitter } from "../../global/mutableState";
import type { InteractionState } from "../../global/types";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useGroupContext } from "../group/useGroupContext";
import type { RegisteredResizeHandle, ResizeHandleProps } from "./types";

/**
 * A `ResizeHandle` provides a visible click target for resizing panels as well as a focusable target for keyboard interactions.
 * `ResizeHandles` should be rendered as the direct child of a `Group` component.
 *
 * ℹ️ `Panels` are always rendered with the following data attributes: `data-resize-handle`, `data-resize-handle-id`, and `data-resize-handle-state`.
 * Custom _hover_ and _active_ styles should use the `data-resize-handle-state` attribute.
 *
 * ✅ Although they are not required, resize handles improve keyboard accessibility.
 */
export function ResizeHandle({
  children,
  className,
  id: idProp,
  style
}: ResizeHandleProps) {
  const id = useId(idProp);

  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [dragState, setDragState] =
    useState<InteractionState["state"]>("inactive");

  const { registerResizeHandle } = useGroupContext();

  // Register ResizeHandle with parent Group
  // Listen to global state for drag state related to this ResizeHandle
  useIsomorphicLayoutEffect(() => {
    if (element !== null) {
      const resizeHandle: RegisteredResizeHandle = {
        element,
        id
      };

      const unregisterResizeHandle = registerResizeHandle(resizeHandle);

      const removeEventListener = eventEmitter.addListener(
        "interactionStateChange",
        (interactionState) => {
          setDragState(
            interactionState.state !== "inactive" &&
              interactionState.hitRegions.some(
                (hitRegion) => hitRegion.resizeHandle === resizeHandle
              )
              ? interactionState.state
              : "inactive"
          );
        }
      );

      return () => {
        unregisterResizeHandle();
        removeEventListener();
      };
    }
  }, [element, id, registerResizeHandle]);

  return (
    <div
      children={children}
      className={className}
      data-resize-handle
      data-resize-handle-id={id}
      data-resize-handle-state={dragState}
      ref={setElement}
      style={{
        flex: "0 0 auto",
        ...style
      }}
    />
  );
}
