"use client";

import type { Properties } from "csstype";
import { useEffect, useRef, useState } from "react";
import { subscribeToMountedGroup } from "../../global/mutable-state/groups";
import { subscribeToInteractionState } from "../../global/mutable-state/interactions";
import type { InteractionState } from "../../global/mutable-state/types";
import { calculateSeparatorAriaValues } from "../../global/utils/calculateSeparatorAriaValues";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableObject } from "../../hooks/useStableObject";
import { useGroupContext } from "../group/useGroupContext";
import type { RegisteredSeparator, SeparatorProps } from "./types";

/**
 * Separators are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * ⚠️ Separator elements must be direct DOM children of their parent Group elements.
 *
 * Separator elements always include the following attributes:
 *
 * ```html
 * <div data-separator data-testid="separator-id-prop" id="separator-id-prop" role="separator">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 *
 * ℹ️ In addition to the attributes shown above, separator also renders all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).
 */
export function Separator({
  children,
  className,
  disabled,
  elementRef: elementRefProp,
  id: idProp,
  style,
  ...rest
}: SeparatorProps) {
  const id = useId(idProp);

  const stableProps = useStableObject({
    disabled
  });

  const [aria, setAria] = useState<{
    valueControls?: string | undefined;
    valueMin?: number | undefined;
    valueMax?: number | undefined;
    valueNow?: number | undefined;
  }>({});

  const [dragState, setDragState] =
    useState<InteractionState["state"]>("inactive");

  const elementRef = useRef<HTMLDivElement | null>(null);

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const {
    disableCursor,
    id: groupId,
    orientation: groupOrientation,
    registerSeparator,
    toggleSeparatorDisabled
  } = useGroupContext();

  const orientation =
    groupOrientation === "horizontal" ? "vertical" : "horizontal";

  // Register Separator with parent Group
  // Listen to global state for drag state related to this Separator
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element !== null) {
      const separator: RegisteredSeparator = {
        disabled: stableProps.disabled,
        element,
        id
      };

      const unregisterSeparator = registerSeparator(separator);

      const removeInteractionStateChangeListener = subscribeToInteractionState(
        (event) => {
          setDragState(
            event.next.state !== "inactive" &&
              event.next.hitRegions.some(
                (hitRegion) => hitRegion.separator === separator
              )
              ? event.next.state
              : "inactive"
          );
        }
      );

      const removeMountedGroupsChangeListener = subscribeToMountedGroup(
        groupId,
        (event) => {
          const { derivedPanelConstraints, layout, separatorToPanels } =
            event.next;
          const panels = separatorToPanels.get(separator);
          if (panels) {
            const primaryPanel = panels[0];
            const panelIndex = panels.indexOf(primaryPanel);

            setAria(
              calculateSeparatorAriaValues({
                layout,
                panelConstraints: derivedPanelConstraints,
                panelId: primaryPanel.id,
                panelIndex
              })
            );
          }
        }
      );

      return () => {
        removeInteractionStateChangeListener();
        removeMountedGroupsChangeListener();
        unregisterSeparator();
      };
    }
  }, [groupId, id, registerSeparator, stableProps]);

  // Not all props require re-registering the separator;
  useEffect(() => {
    toggleSeparatorDisabled(id, !!disabled);
  }, [disabled, id, toggleSeparatorDisabled]);

  let cursor: Properties["cursor"] = undefined;
  if (disabled && !disableCursor) {
    cursor = "not-allowed";
  }

  return (
    <div
      {...rest}
      aria-controls={aria.valueControls}
      aria-disabled={disabled || undefined}
      aria-orientation={orientation}
      aria-valuemax={aria.valueMax}
      aria-valuemin={aria.valueMin}
      aria-valuenow={aria.valueNow}
      children={children}
      className={className}
      data-separator={disabled ? "disabled" : dragState}
      data-testid={id}
      id={id}
      ref={mergedRef}
      role="separator"
      style={{
        flexBasis: "auto",
        cursor,

        ...style,

        flexGrow: 0,
        flexShrink: 0,

        // Inform the browser that the library is handling touch events for this element
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: "none"
      }}
      tabIndex={disabled ? undefined : 0}
    />
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Separator.displayName = "Separator";
