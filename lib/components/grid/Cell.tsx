"use client";

import { useRef } from "react";
import { useId } from "../../hooks/useId";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../hooks/useStableCallback";
import { useGridContext } from "./GridContext";
import type { CellProps, CellSize } from "./types";

/** A rectangular region of a Grid. Positions are zero-based; spans default to one. */
export function Cell({
  id: idProp,
  row,
  column,
  rowSpan = 1,
  columnSpan = 1,
  elementRef,
  onResize,
  children,
  style,
  ...rest
}: CellProps) {
  const id = useId(idProp);
  const { registerCell } = useGridContext();
  const ref = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(ref, elementRef);
  const previousSize = useRef<CellSize | undefined>(undefined);
  const notify = useStableCallback((size: CellSize) => {
    const previous = previousSize.current;
    if (JSON.stringify(previous) !== JSON.stringify(size)) {
      previousSize.current = size;
      onResize?.(size, idProp, previous);
    }
  });
  for (const [name, value, minimum] of [
    ["row", row, 0],
    ["column", column, 0],
    ["rowSpan", rowSpan, 1],
    ["columnSpan", columnSpan, 1]
  ] as const) {
    if (!Number.isInteger(value) || value < minimum)
      throw Error(
        `Cell ${name} must be an integer greater than or equal to ${minimum}`
      );
  }
  useIsomorphicLayoutEffect(
    () => registerCell({ id, row, column, rowSpan, columnSpan }),
    [registerCell, id, row, column, rowSpan, columnSpan]
  );
  const hasOnResize = !!onResize;
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || !hasOnResize) return;
    const parent = element.closest<HTMLElement>("[data-grid]");
    const Observer = element.ownerDocument.defaultView?.ResizeObserver;
    if (!parent || !Observer) return;
    const observer = new Observer(() => {
      const rect = element.getBoundingClientRect();
      const gridRect = parent.getBoundingClientRect();
      notify({
        width: {
          inPixels: rect.width,
          asPercentage: gridRect.width ? (100 * rect.width) / gridRect.width : 0
        },
        height: {
          inPixels: rect.height,
          asPercentage: gridRect.height
            ? (100 * rect.height) / gridRect.height
            : 0
        }
      });
    });
    observer.observe(element);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [hasOnResize, notify]);
  return (
    <div
      {...rest}
      id={id}
      ref={mergedRef}
      data-cell=""
      data-testid={id}
      style={{
        overflow: "auto",
        ...style,
        minWidth: 0,
        minHeight: 0,
        gridRow: `${row * 2 + 1} / span ${rowSpan * 2 - 1}`,
        gridColumn: `${column * 2 + 1} / span ${columnSpan * 2 - 1}`
      }}
    >
      {children}
    </div>
  );
}
