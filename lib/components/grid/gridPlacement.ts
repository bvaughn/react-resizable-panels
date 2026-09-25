/**
 * When a Grid axis contains separators, "gutter" tracks are interleaved between the content tracks
 * (e.g. `grid-template-columns: 1fr auto 1fr`) so separators can be placed between cells.
 * These helpers convert track indices to CSS grid lines accordingly.
 */

// Returns the (1-based) CSS grid line where the specified track starts
export function getTrackGridLine(index: number, hasGutters: boolean) {
  return hasGutters ? index * 2 + 1 : index + 1;
}

// Returns the number of CSS grid tracks spanned by the specified number of content tracks
export function getTrackGridSpan(span: number, hasGutters: boolean) {
  return hasGutters ? span * 2 - 1 : span;
}

// Returns the CSS grid placement (e.g. "1 / span 3") for the specified track range
export function getTrackGridPlacement(
  index: number,
  span: number | undefined,
  hasGutters: boolean
) {
  const line = getTrackGridLine(index, hasGutters);

  return span === undefined
    ? `${line} / -1`
    : `${line} / span ${getTrackGridSpan(span, hasGutters)}`;
}

// Returns the CSS grid placement for the gutter between tracks `index - 1` and `index`
export function getGutterGridPlacement(index: number) {
  return `${index * 2} / span 1`;
}

// Returns the CSS grid placement for a separator along the opposite axis (e.g. the rows a column separator spans).
// Separators that don't start (or end) at the edge of the grid extend into the adjacent gutter (if there is one)
// so that they meet any separators that intersect them.
export function getSeparatorCrossGridPlacement({
  crossCount,
  crossSpan,
  crossStart,
  hasGutters
}: {
  crossCount: number;
  crossSpan: number | undefined;
  crossStart: number;
  hasGutters: boolean;
}) {
  const crossEnd =
    crossSpan === undefined ? crossCount : crossStart + crossSpan;
  if (crossStart === 0 && crossEnd === crossCount) {
    return "1 / -1";
  }

  let startLine = getTrackGridLine(crossStart, hasGutters);
  let endLine = getTrackGridLine(crossEnd - 1, hasGutters) + 1;
  if (hasGutters) {
    if (crossStart > 0) {
      startLine--;
    }
    if (crossEnd < crossCount) {
      endLine++;
    }
  }

  return `${startLine} / ${endLine}`;
}

/**
 * Gridlines sit between two tracks (e.g. column 1 is between columns 0 and 1)
 */
export function isValidGridlineIndex(index: number, trackCount: number) {
  return Number.isInteger(index) && index >= 1 && index < trackCount;
}
