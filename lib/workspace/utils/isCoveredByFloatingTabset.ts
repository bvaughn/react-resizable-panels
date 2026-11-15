/**
 * Whether another floating tabset is shown over part of this floating tabset's element (one that's stacked above it and overlaps it on the screen).
 * Floating tabsets are siblings within the floating layer, stacked by their z-index (see FloatingTabsets);
 * the elements' rendered boxes are compared (rather than the model's sizes), since collapsed tabsets are smaller than their sizes.
 */
export function isCoveredByFloatingTabset(element: HTMLElement): boolean {
  const zIndex = Number(element.style.zIndex) || 0;
  const rect = element.getBoundingClientRect();

  for (const sibling of Array.from(element.parentElement?.children ?? [])) {
    if (
      sibling === element ||
      !sibling.hasAttribute("data-floating-tabset") ||
      (Number((sibling as HTMLElement).style.zIndex) || 0) <= zIndex
    ) {
      continue;
    }

    const other = sibling.getBoundingClientRect();
    if (
      other.left < rect.right &&
      other.right > rect.left &&
      other.top < rect.bottom &&
      other.bottom > rect.top
    ) {
      return true;
    }
  }

  return false;
}
