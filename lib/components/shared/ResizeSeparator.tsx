"use client";

import type { Properties } from "csstype";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref
} from "react";
import { subscribeToMountedAxis } from "../../global/mutable-state/axes";
import {
  notifySeparatorPreviewChanged,
  subscribeToInteractionState
} from "../../global/mutable-state/interactions";
import type { InteractionState } from "../../global/mutable-state/types";
import type {
  HitRegion,
  Orientation,
  RegisteredSeparator
} from "../../global/types";
import { calculateSeparatorAriaValues } from "../../global/utils/calculateSeparatorAriaValues";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useStableObject } from "../../hooks/useStableObject";

/**
 * @internal
 * Shared implementation of the `Separator` (within a Group) and `Gridline` (within a Grid) components.
 *
 * It registers a separator with the resize axis it belongs to, tracks its hover/drag/focus state,
 * and renders the separator element (including its WAI-ARIA attributes).
 * Everything specific to the parent component is passed in explicitly (rather than read from context).
 */
export function ResizeSeparator({
  attributes,
  axisId,
  axisOrientation,
  children,
  className,
  disableCursor,
  disabled,
  disableDoubleClick,
  elementRef: elementRefProp,
  id,
  isSharedHitRegion,
  preview,
  registerSeparator,
  requiredStyle,
  style,
  styleDefaults,
  tabIndex = 0,
  updateSeparatorProps
}: {
  /** Additional HTML attributes to render on the separator element */
  attributes?: HTMLAttributes<HTMLDivElement> | undefined;

  /** Id of the resize axis (e.g. the Group) this separator belongs to */
  axisId: string;

  /** Orientation of the resize axis; the separator's `aria-orientation` is the opposite */
  axisOrientation: Orientation;

  children: ReactNode | undefined;
  className: string | undefined;
  disableCursor: boolean;
  disabled: boolean | undefined;
  disableDoubleClick: boolean | undefined;
  elementRef: Ref<HTMLDivElement> | undefined;
  id: string;

  /**
   * Hit regions that resize the same items as this separator (e.g. other separators along the same Grid boundary);
   * this separator shares hover/active state with them.
   */
  isSharedHitRegion?: ((hitRegion: HitRegion) => boolean) | undefined;

  preview?: ReactNode;
  registerSeparator: (separator: RegisteredSeparator) => () => void;

  /** Styles that cannot be overridden by the `style` prop */
  requiredStyle?: CSSProperties | undefined;

  style: CSSProperties | undefined;

  /** Styles that can be overridden by the `style` prop */
  styleDefaults?: CSSProperties | undefined;

  tabIndex?: number | undefined;
  updateSeparatorProps: (
    id: string,
    props: {
      disabled: boolean | undefined;
      disableDoubleClick: boolean | undefined;
    }
  ) => void;
}) {
  const stableProps = useStableObject({
    disabled,
    disableDoubleClick,
    children,
    className,
    preview,
    style
  });

  const [aria, setAria] = useState<{
    valueControls?: string | undefined;
    valueMin?: number | undefined;
    valueMax?: number | undefined;
    valueNow?: number | undefined;
  }>({});

  const [dragState, setDragState] =
    useState<InteractionState["state"]>("inactive");
  const [isFocused, setIsFocused] = useState(false);

  const elementRef = useRef<HTMLDivElement | null>(null);
  const registeredSeparatorRef = useRef<RegisteredSeparator | null>(null);

  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const orientation =
    axisOrientation === "horizontal" ? "vertical" : "horizontal";

  // Register the separator with its resize axis
  // Listen to global state for drag state related to this separator
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element !== null) {
      const separator: RegisteredSeparator = {
        disabled: stableProps.disabled,
        disableDoubleClick: stableProps.disableDoubleClick,
        element,
        id,
        get children() {
          return stableProps.children;
        },
        get className() {
          return stableProps.className;
        },
        get preview() {
          return stableProps.preview;
        },
        get style() {
          return stableProps.style;
        }
      };

      registeredSeparatorRef.current = separator;

      const unregisterSeparator = registerSeparator(separator);

      const removeInteractionStateChangeListener = subscribeToInteractionState(
        (event) => {
          setDragState(
            event.next.state !== "inactive" &&
              event.next.hitRegions.some(
                (hitRegion) =>
                  hitRegion.separator === separator ||
                  (isSharedHitRegion?.(hitRegion) ?? false)
              )
              ? event.next.state
              : "inactive"
          );
        }
      );

      const removeMountedAxesChangeListener = subscribeToMountedAxis(
        axisId,
        (event) => {
          const { derivedItemConstraints, layout, separatorToItems } =
            event.next;
          const items = separatorToItems.get(separator);
          if (items) {
            const primaryItem = items[0];

            // The index must be relative to the Group's panels (not the pair this Separator sits between
            // because it's used as a pivot index into the Group's layout.
            // derivedPanelConstraints is derived from group.panels, so it's already in panel order.
            // See #740.
            const itemIndex = derivedItemConstraints.findIndex(
              (constraints) => constraints.itemId === primaryItem.id
            );

            const { layoutStrategy } = event.axis;

            setAria({
              ...calculateSeparatorAriaValues({
                layout,
                itemConstraints: derivedItemConstraints,
                itemId: primaryItem.id,
                itemIndex
              }),
              // Items without DOM elements of their own (e.g. Grid tracks) control other elements
              ...(layoutStrategy?.getItemAriaControls && {
                valueControls: layoutStrategy.getItemAriaControls(
                  primaryItem.id
                )
              })
            });
          }
        }
      );

      return () => {
        registeredSeparatorRef.current = null;

        removeInteractionStateChangeListener();
        removeMountedAxesChangeListener();
        unregisterSeparator();
      };
    }
  }, [axisId, id, isSharedHitRegion, registerSeparator, stableProps]);

  useIsomorphicLayoutEffect(() => {
    const separator = registeredSeparatorRef.current;
    if (separator) {
      notifySeparatorPreviewChanged(separator);
    }
  }, [preview]);

  // Not all props require re-registering the separator;
  useEffect(() => {
    updateSeparatorProps(id, { disabled, disableDoubleClick });
  }, [disabled, disableDoubleClick, id, updateSeparatorProps]);

  let cursor: Properties["cursor"] = undefined;
  if (disabled && !disableCursor) {
    cursor = "not-allowed";
  }

  let dataSeparator = undefined;
  if (disabled) {
    dataSeparator = "disabled";
  } else {
    switch (dragState) {
      case "active": {
        dataSeparator = "active";
        break;
      }
      default: {
        if (isFocused) {
          dataSeparator = "focus";
        } else {
          dataSeparator = dragState;
        }
      }
    }
  }

  return (
    <div
      {...attributes}
      aria-controls={aria.valueControls}
      aria-disabled={disabled || undefined}
      aria-orientation={orientation}
      aria-valuemax={aria.valueMax}
      aria-valuemin={aria.valueMin}
      aria-valuenow={aria.valueNow}
      children={children}
      className={className}
      data-separator={dataSeparator}
      data-testid={id}
      id={id}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      ref={mergedRef}
      role="separator"
      style={{
        ...styleDefaults,
        cursor,

        ...style,

        ...requiredStyle,

        // Inform the browser that the library is handling touch events for this element
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: "none"
      }}
      tabIndex={disabled ? undefined : tabIndex}
    />
  );
}
