"use client";

import { useRef } from "react";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { getTrackGridPlacement } from "./gridPlacement";
import type { CellProps } from "./types";
import { useGridContext } from "./useGridContext";

/**
 * A Cell occupies one or more tracks (columns and rows) within a Grid.
 * Cells are resized along with the tracks they occupy.
 *
 * Cell elements always include the following attributes:
 *
 * ```html
 * <div data-cell data-testid="cell-id-prop" id="cell-id-prop">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 *
 * ⚠️ Cell elements must be direct DOM children of their parent Grid elements.
 */
export function Cell({
  children,
  className,
  column,
  columnSpan = 1,
  elementRef: elementRefProp,
  id: idProp,
  row,
  rowSpan = 1,
  style,
  ...rest
}: CellProps) {
  const id = useId(idProp);

  // Invalid placements are logged by the Grid (see getPlacementErrors)
  const { gutters, registerCell } = useGridContext();

  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element !== null) {
      return registerCell({
        column,
        columnSpan,
        element,
        id,
        row,
        rowSpan
      });
    }
  }, [column, columnSpan, id, registerCell, row, rowSpan]);

  return (
    <div
      {...rest}
      className={className}
      data-cell
      data-testid={id}
      id={id}
      ref={mergedRef}
      style={{
        overflow: "auto",

        ...style,

        // Allow cells to shrink smaller than their content
        minHeight: 0,
        minWidth: 0,

        gridColumn: getTrackGridPlacement(column, columnSpan, gutters.column),
        gridRow: getTrackGridPlacement(row, rowSpan, gutters.row)
      }}
    >
      {children}
    </div>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Cell.displayName = "Cell";
