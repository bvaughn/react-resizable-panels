"use client";

import { GridTrackSeparator } from "./GridTrackSeparator";
import type { GridlineProps } from "./types";

/**
 * Resizes the columns (or rows) of a Grid.
 *
 * For example:
 *
 * ```tsx
 * // Rendered between columns 0 and 1 and spans all rows
 * <Gridline type="column" column={1} />
 * ```
 *
 * ```tsx
 * // Rendered between rows 0 and 1 and spans all columns
 * <Gridline type="row" row={1} />
 * ```
 *
 * ```tsx
 * // Rendered between columns 0 and 1 alongside of row 2 only
 * <Gridline type="column" column={1} row={2} rowSpan={1} />
 * ```
 *
 * A gridline should not be rendered alongside of a Cell that spans across its boundary
 * (this includes disabled gridlines; an error will be logged to the console);
 * render multiple gridlines along the same boundary instead (e.g. before and after the spanning Cell).
 *
 * ℹ️ Once a boundary contains a gridline, it can only be resized using gridlines;
 * the parts of the boundary that aren't alongside of a gridline can't be dragged.
 *
 * Where column and row gridlines intersect, dragging resizes both axes.
 *
 * Gridlines are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * Gridline elements always include the following attributes:
 *
 * ```html
 * <div aria-orientation="vertical" data-separator role="separator">
 * ```
 *
 * ℹ️ Column gridlines are vertical (`aria-orientation="vertical"`) and row gridlines are horizontal (`aria-orientation="horizontal"`).
 *
 * ℹ️ In addition to the attributes shown above, gridlines also render all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).
 *
 * ⚠️ Gridline elements must be direct DOM children of their parent Grid elements.
 *
 * ℹ️ Gridlines rendered by another component (rather than directly within the Grid) aren't detected until they mount, so server-rendered layouts may shift slightly during hydration.
 */
export function Gridline(props: GridlineProps) {
  const { children, className, disabled, elementRef, style } = props;

  return props.type === "column" ? (
    <GridTrackSeparator
      axis="column"
      className={className}
      crossSpan={props.rowSpan}
      crossStart={props.row ?? 0}
      disabled={disabled}
      elementRef={elementRef}
      index={props.column}
      style={style}
    >
      {children}
    </GridTrackSeparator>
  ) : (
    <GridTrackSeparator
      axis="row"
      className={className}
      crossSpan={props.columnSpan}
      crossStart={props.column ?? 0}
      disabled={disabled}
      elementRef={elementRef}
      index={props.row}
      style={style}
    >
      {children}
    </GridTrackSeparator>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Gridline.displayName = "Gridline";
