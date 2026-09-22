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
