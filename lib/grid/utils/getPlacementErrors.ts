import type { RegisteredSeparator } from "../../global/types";
import type { GridSeparatorPlacement, RegisteredCell } from "../types";
import { isValidGridlineIndex } from "./gridPlacement";
import { AXES } from "../constants";

export function getPlacementErrors({
  cells,
  separatorPlacements,
  trackCounts
}: {
  cells: RegisteredCell[];
  separatorPlacements: ReadonlyMap<RegisteredSeparator, GridSeparatorPlacement>;
  trackCounts: { column: number; row: number };
}): string[] {
  const errors: string[] = [];

  // Cells must be placed within the Grid's tracks
  for (const cell of cells) {
    AXES.forEach((axis) => {
      const [index, span] =
        axis === "column"
          ? [cell.column, cell.columnSpan]
          : [cell.row, cell.rowSpan];
      const trackCount = trackCounts[axis];
      if (
        !Number.isInteger(index) ||
        !Number.isInteger(span) ||
        index < 0 ||
        span < 1 ||
        index + span > trackCount
      ) {
        errors.push(
          `Invalid Cell ${axis} placement (${axis}: ${index}, ${axis}Span: ${span}); Grid has ${trackCount} ${axis}s`
        );
      }
    });
  }

  const describe = ({
    axis,
    crossSpan,
    crossStart,
    disabled,
    index
  }: GridSeparatorPlacement) => {
    const crossAxis = axis === "column" ? "row" : "column";
    let props = `type="${axis}" ${axis}={${index}}`;
    if (crossStart !== 0 || crossSpan !== undefined) {
      props += ` ${crossAxis}={${crossStart}}`;
    }
    if (crossSpan !== undefined) {
      props += ` ${crossAxis}Span={${crossSpan}}`;
    }
    if (disabled) {
      props += " disabled";
    }
    return `<Gridline ${props} />`;
  };

  // Gridlines must be placed between two tracks (and alongside of tracks on the opposite axis)
  const placements = Array.from(separatorPlacements.values()).filter(
    (placement) => {
      const { axis, crossSpan, crossStart, index } = placement;
      const crossAxis = axis === "column" ? "row" : "column";
      const trackCount = trackCounts[axis];
      const crossCount = trackCounts[crossAxis];

      let isValid = true;
      if (!isValidGridlineIndex(index, trackCount)) {
        errors.push(
          `Invalid ${axis} Gridline ${axis} (${index}); must be between 1 and ${trackCount - 1}`
        );
        isValid = false;
      }
      if (
        !Number.isInteger(crossStart) ||
        crossStart < 0 ||
        crossStart >= crossCount
      ) {
        errors.push(
          `Invalid ${axis} Gridline ${crossAxis} (${crossStart}); must be between 0 and ${crossCount - 1}`
        );
        isValid = false;
      } else if (
        crossSpan !== undefined &&
        (!Number.isInteger(crossSpan) ||
          crossSpan < 1 ||
          crossStart + crossSpan > crossCount)
      ) {
        errors.push(
          `Invalid ${axis} Gridline ${crossAxis}Span (${crossSpan}); Grid has ${crossCount} ${crossAxis}s`
        );
        isValid = false;
      }

      // Gridlines with invalid placements are not checked for overlaps (below)
      return isValid;
    }
  );

  const getCrossRange = (placement: GridSeparatorPlacement) => {
    const crossCount =
      trackCounts[placement.axis === "column" ? "row" : "column"];
    return [
      placement.crossStart,
      placement.crossSpan === undefined
        ? crossCount
        : placement.crossStart + placement.crossSpan
    ];
  };

  placements.forEach((placement, placementIndex) => {
    const { axis, index } = placement;
    const [crossStart, crossEnd] = getCrossRange(placement);

    // Gridlines should not be rendered alongside of cells that span across their boundary
    for (const cell of cells) {
      const [start, span, cellCrossStart, cellCrossSpan] =
        axis === "column"
          ? [cell.column, cell.columnSpan, cell.row, cell.rowSpan]
          : [cell.row, cell.rowSpan, cell.column, cell.columnSpan];
      if (
        start < index &&
        index < start + span &&
        cellCrossStart < crossEnd &&
        crossStart < cellCrossStart + cellCrossSpan
      ) {
        const crossAxis = axis === "column" ? "row" : "column";
        errors.push(
          `${describe(placement)} overlaps a Cell that spans across it (${axis}: ${start}, ${axis}Span: ${span}, ${crossAxis}: ${cellCrossStart}, ${crossAxis}Span: ${cellCrossSpan}); use the ${crossAxis} and ${crossAxis}Span props to render gridlines beside the Cell instead`
        );
      }
    }

    // Gridlines along the same boundary should not overlap each other
    for (const other of placements.slice(placementIndex + 1)) {
      if (other.axis === axis && other.index === index) {
        const [otherCrossStart, otherCrossEnd] = getCrossRange(other);
        if (otherCrossStart < crossEnd && crossStart < otherCrossEnd) {
          errors.push(`${describe(placement)} overlaps ${describe(other)}`);
        }
      }
    }
  });

  return errors;
}
