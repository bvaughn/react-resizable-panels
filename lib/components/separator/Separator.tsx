"use client";

import { useEffect, useRef, useState } from "react";
import { eventEmitter } from "../../global/mutableState";
import type { InteractionState } from "../../global/types";
import { calculateSeparatorAriaValues } from "../../global/utils/calculateSeparatorAriaValues";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useGroupContext } from "../group/useGroupContext";
import type { RegisteredSeparator, SeparatorProps } from "./types";
import type { Properties } from "csstype";
import { useStableObject } from "../../hooks/useStableObject";

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

      const removeInteractionStateChangeListener = eventEmitter.addListener(
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

      const removeMountedGroupsChangeListener = eventEmitter.addListener(
        "mountedGroupsChange",
        (mountedGroups) => {
          mountedGroups.forEach(
            (
              { derivedPanelConstraints, layout, separatorToPanels },
              mountedGroup
            ) => {
              if (mountedGroup.id === groupId) {
                const panels = separatorToPanels.get(separator);
                if (panels) {
                  const primaryPanel = panels[0];
                  const panelIndex = mountedGroup.panels.indexOf(primaryPanel);

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
            }
          );
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
        touchAction: "none" // Disable touch scrolling while dragging
      }}
      tabIndex={disabled ? undefined : 0}
    />
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Separator.displayName = "Separator";
