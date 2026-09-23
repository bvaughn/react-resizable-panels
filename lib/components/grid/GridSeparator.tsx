"use client";

import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useGridContext } from "./GridContext";
import { getSegments, resizeAxis } from "./gridLayout";
import type { GridSeparatorProps } from "./types";

/** Override the generated separator for a Grid boundary. */
export function GridSeparator(props: GridSeparatorProps) {
  const { registerSeparator } = useGridContext();
  const key = `${props.axis}:${props.after}`;
  useIsomorphicLayoutEffect(
    () => registerSeparator(key),
    [key, registerSeparator]
  );
  return <GridBoundary {...props} />;
}

export function GridBoundary({
  axis,
  after,
  disabled,
  disableDoubleClick,
  elementRef,
  id: idProp,
  children,
  style,
  onKeyDown,
  onDoubleClick,
  ...rest
}: GridSeparatorProps) {
  const context = useGridContext();
  const key = axis === "column" ? "columns" : "rows";
  const crossKey = axis === "column" ? "rows" : "columns";
  const constraints = context.constraints[key];
  if (
    !Number.isInteger(after) ||
    after < 0 ||
    after >= constraints.length - 1
  ) {
    // Inferred tracks register after the initial render.
    if (constraints.length)
      throw Error(`Invalid Grid separator boundary: ${axis} after ${after}`);
    return null;
  }
  const layout = context.layout[key];
  const position = (sizes: typeof layout) =>
    constraints
      .slice(0, after + 1)
      .reduce((total, track) => total + sizes[track.panelId], 0);
  const minimum = position(
    resizeAxis(layout, constraints, after, -100, "keyboard")
  );
  const maximum = position(
    resizeAxis(layout, constraints, after, 100, "keyboard")
  );
  const isDisabled = context.disabled || disabled || minimum === maximum;
  const active = context.active.includes(`${axis}:${after}`);
  const segments = getSegments(
    axis,
    after,
    context.constraints[crossKey].length,
    context.cells
  );
  const controls = context.cells
    .filter((cell) =>
      axis === "column"
        ? cell.column <= after && cell.column + cell.columnSpan <= after + 1
        : cell.row <= after && cell.row + cell.rowSpan <= after + 1
    )
    .map(({ id }) => id)
    .join(" ");
  return segments.map(({ start, span }, index) => (
    <div
      {...rest}
      key={start}
      id={
        idProp === undefined
          ? `${context.id}-${axis}-${after}-${start}`
          : String(idProp) + (index ? `-${index}` : "")
      }
      ref={index === 0 ? elementRef : undefined}
      data-grid-separator=""
      data-axis={axis}
      data-after={after}
      data-separator={isDisabled ? "disabled" : active ? "active" : "inactive"}
      role="separator"
      aria-label={
        rest["aria-label"] ??
        `Resize ${axis === "column" ? "columns" : "rows"} ${after + 1} and ${after + 2}`
      }
      aria-orientation={axis === "column" ? "vertical" : "horizontal"}
      aria-controls={controls || undefined}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuenow={position(layout)}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : index === 0 ? 0 : -1}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          isDisabled ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        const negative = axis === "column" ? "ArrowLeft" : "ArrowUp";
        const positive = axis === "column" ? "ArrowRight" : "ArrowDown";
        const step = event.shiftKey ? 10 : 5;
        const delta =
          event.key === negative
            ? -step
            : event.key === positive
              ? step
              : event.key === "Home"
                ? -100
                : event.key === "End"
                  ? 100
                  : undefined;
        if (delta !== undefined) {
          event.preventDefault();
          event.stopPropagation();
          context.resize(axis, after, delta);
        }
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (!event.defaultPrevented && !isDisabled && !disableDoubleClick)
          context.reset(axis, after);
      }}
      style={{
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        ...style,
        gridColumn:
          axis === "column"
            ? `${after * 2 + 2}`
            : `${start * 2 + 1} / span ${span * 2 - 1}`,
        gridRow:
          axis === "row"
            ? `${after * 2 + 2}`
            : `${start * 2 + 1} / span ${span * 2 - 1}`,
        minWidth: 0,
        minHeight: 0,
        zIndex: 1,
        touchAction: "none",
        cursor: context.disableCursor
          ? undefined
          : isDisabled
            ? "default"
            : axis === "column"
              ? "col-resize"
              : "row-resize"
      }}
    >
      {children}
    </div>
  ));
}
