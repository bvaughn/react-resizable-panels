import { useState } from "react";
import { eventEmitter } from "../../global/mutableState";
import type { InteractionState } from "../../global/types";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useGroupContext } from "../group/useGroupContext";
import type { RegisteredSeparator, SeparatorProps } from "./types";
import { useMergedRefs } from "../../hooks/useMergedRefs";

/**
 * Separators are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * Separators should be rendered as the direct child of a Group component.
 *
 * For unit testing purposes, Separator elements always include the following data attributes:
 *
 * ```html
 * <div data-separator data-separator-id="your-separator-id" />
 * ```
 */
export function Separator({
  children,
  className,
  elementRef,
  id: idProp,
  style
}: SeparatorProps) {
  const id = useId(idProp);

  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [dragState, setDragState] =
    useState<InteractionState["state"]>("inactive");

  const mergedRef = useMergedRefs(setElement, elementRef);

  const { registerSeparator } = useGroupContext();

  // Register Separator with parent Group
  // Listen to global state for drag state related to this Separator
  useIsomorphicLayoutEffect(() => {
    if (element !== null) {
      const separator: RegisteredSeparator = {
        element,
        id
      };

      const unregisterSeparator = registerSeparator(separator);

      const removeEventListener = eventEmitter.addListener(
        "interactionStateChange",
        (interactionState) => {
          setDragState(
            interactionState.state !== "inactive" &&
              interactionState.hitRegions.some(
                (hitRegion) => hitRegion.separator === separator
              )
              ? interactionState.state
              : "inactive"
          );
        }
      );

      return () => {
        unregisterSeparator();
        removeEventListener();
      };
    }
  }, [element, id, registerSeparator]);

  return (
    <div
      children={children}
      className={className}
      data-separator
      data-separator-id={id}
      data-separator-state={dragState}
      ref={mergedRef}
      style={{
        flexBasis: "auto",
        ...style,
        flexGrow: 0,
        flexShrink: 0
      }}
    />
  );
}
