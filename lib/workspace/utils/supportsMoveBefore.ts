export type MoveBefore = (node: Node, child: Node | null) => void;

/**
 * Whether the browser can move an element without removing it first (`moveBefore`; not supported by Safari),
 * which preserves browser state that's tied to its place in the document (see moveElement).
 */
export function supportsMoveBefore(
  element: Element
): element is Element & { moveBefore: MoveBefore } {
  return (
    typeof (element as Element & { moveBefore?: MoveBefore }).moveBefore ===
    "function"
  );
}
