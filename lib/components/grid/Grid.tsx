"use client";

import {
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { Layout } from "../group/types";
import { useId } from "../../hooks/useId";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../hooks/useStableCallback";
import { GridContext } from "./GridContext";
import { GridBoundary } from "./GridSeparator";
import {
  copyLayout,
  getConstraints,
  getSegments,
  getTracks,
  reconcileAxis,
  resizeAxis,
  validateAxis,
  validateCells
} from "./gridLayout";
import type { GridAxis, GridLayout, GridProps, RegisteredCell } from "./types";

type Boundary = { axis: GridAxis; after: number };
type Gesture = { cleanup: () => void };

/** A resizable two-dimensional layout with shared row and column tracks. */
export function Grid({
  children,
  id: idProp,
  rows: rowsProp,
  columns: columnsProp,
  gap = 4,
  defaultLayout,
  gridRef,
  elementRef,
  disabled = false,
  disableCursor = false,
  resizeTargetMinimumSize = { fine: 10, coarse: 20 },
  onLayoutChange,
  onLayoutChanged,
  style,
  onPointerDownCapture,
  ...rest
}: GridProps) {
  const id = useId(idProp);
  const ref = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(ref, elementRef);
  const [cells, setCells] = useState<RegisteredCell[]>([]);
  const [customSeparators, setCustomSeparators] = useState<string[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [stored, setStored] = useState<GridLayout | undefined>(defaultLayout);
  const [active, setActive] = useState<string[]>([]);
  const gesture = useRef<Gesture | null>(null);
  const lastChange = useRef("");
  const lastChanged = useRef("");
  const latest = useRef<GridLayout>({ rows: {}, columns: {} });
  const ready = size.width > 0 && size.height > 0;
  if (!Number.isFinite(gap) || gap < 0)
    throw Error("Grid gap must be finite and non-negative");
  const rows = getTracks(
    rowsProp,
    cells.reduce((count, cell) => Math.max(count, cell.row + cell.rowSpan), 0)
  );
  const columns = getTracks(
    columnsProp,
    cells.reduce(
      (count, cell) => Math.max(count, cell.column + cell.columnSpan),
      0
    )
  );
  validateCells(cells, rows.length, columns.length);
  const available = {
    rows: Math.max(0, size.height - gap * Math.max(0, rows.length - 1)),
    columns: Math.max(0, size.width - gap * Math.max(0, columns.length - 1))
  };
  const constraints = {
    rows: getConstraints(rows, available.rows, ref.current),
    columns: getConstraints(columns, available.columns, ref.current)
  };
  const layout: GridLayout = {
    rows: reconcileAxis(stored?.rows, constraints.rows),
    columns: reconcileAxis(stored?.columns, constraints.columns)
  };

  const registerCell = useStableCallback((cell: RegisteredCell) => {
    setCells((previous) => {
      if (previous.some(({ id }) => id === cell.id))
        throw Error(`Duplicate Grid cell id "${cell.id}"`);
      return [...previous, cell];
    });
    return () =>
      setCells((previous) => previous.filter((current) => current !== cell));
  });
  const registerSeparator = useStableCallback((key: string) => {
    setCustomSeparators((previous) => {
      if (previous.includes(key))
        throw Error(`Duplicate Grid separator "${key}"`);
      return [...previous, key];
    });
    return () =>
      setCustomSeparators((previous) =>
        previous.filter((current) => current !== key)
      );
  });

  const publish = useStableCallback(
    (next: GridLayout, isUserInteraction: boolean, complete: boolean) => {
      latest.current = copyLayout(next);
      if (!ready || !rows.length || !columns.length) return;
      setStored((previous) =>
        JSON.stringify(previous) === JSON.stringify(next)
          ? previous
          : copyLayout(next)
      );
      const signature = JSON.stringify(next);
      if (lastChange.current !== signature) {
        lastChange.current = signature;
        onLayoutChange?.(copyLayout(next));
      }
      if (complete && lastChanged.current !== signature) {
        lastChanged.current = signature;
        onLayoutChanged?.(copyLayout(next), { isUserInteraction });
      }
    }
  );
  const syncLayout = useStableCallback(() =>
    publish(layout, false, !gesture.current)
  );
  const layoutSignature = JSON.stringify(layout);
  useIsomorphicLayoutEffect(() => {
    syncLayout();
  }, [layoutSignature, ready, syncLayout]);

  useImperativeHandle(gridRef, () => ({
    getLayout: () => copyLayout(latest.current),
    setLayout: (next) => {
      const validated = {
        rows: validateAxis(next.rows, constraints.rows),
        columns: validateAxis(next.columns, constraints.columns)
      };
      gesture.current?.cleanup();
      gesture.current = null;
      setActive([]);
      publish(validated, false, true);
      return copyLayout(validated);
    }
  }));

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize((previous) =>
        previous.width === rect.width && previous.height === rect.height
          ? previous
          : { width: rect.width, height: rect.height }
      );
    };
    measure();
    const Observer = element.ownerDocument.defaultView?.ResizeObserver;
    if (!Observer) return;
    const observer = new Observer(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // A gesture's initial geometry cannot survive a topology, constraint, or container change.
  const interactionSignature = JSON.stringify({
    cells,
    constraints,
    size,
    gap,
    disabled,
    customSeparators
  });
  useIsomorphicLayoutEffect(() => {
    if (gesture.current) {
      gesture.current.cleanup();
      gesture.current = null;
      setActive([]);
      publish(latest.current, false, true);
    }
  }, [interactionSignature, publish]);
  useIsomorphicLayoutEffect(
    () => () => {
      gesture.current?.cleanup();
      gesture.current = null;
    },
    []
  );

  const resize = useStableCallback(
    (axis: GridAxis, after: number, delta: number) => {
      if (disabled) return;
      const key = axis === "column" ? "columns" : "rows";
      publish(
        {
          ...latest.current,
          [key]: resizeAxis(
            latest.current[key],
            constraints[key],
            after,
            delta,
            "keyboard"
          )
        },
        true,
        true
      );
    }
  );
  const reset = useStableCallback((axis: GridAxis, after: number) => {
    const key = axis === "column" ? "columns" : "rows";
    const initial = reconcileAxis(defaultLayout?.[key], constraints[key]);
    const track = constraints[key][after].panelId;
    resize(axis, after, initial[track] - latest.current[key][track]);
  });

  const begin = (event: ReactPointerEvent<HTMLDivElement>) => {
    onPointerDownCapture?.(event);
    const element = ref.current;
    if (
      event.defaultPrevented ||
      disabled ||
      !ready ||
      !element ||
      event.button !== 0 ||
      event.isPrimary === false ||
      gesture.current
    )
      return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-grid]") !== element) return;
    const minimum =
      event.pointerType === "touch"
        ? resizeTargetMinimumSize.coarse
        : resizeTargetMinimumSize.fine;
    const matches = new Map<
      GridAxis,
      { boundary: Boundary; distance: number }
    >();
    for (const child of Array.from(
      element.querySelectorAll<HTMLElement>("[data-grid-separator]")
    )) {
      if (
        child.closest("[data-grid]") !== element ||
        child.getAttribute("aria-disabled") === "true"
      )
        continue;
      const axis = child.dataset.axis as GridAxis;
      const rect = child.getBoundingClientRect();
      const xPadding = Math.max(0, minimum - rect.width) / 2;
      const yPadding = Math.max(0, minimum - rect.height) / 2;
      // A half-gutter extension joins perpendicular segments at intersections.
      const xExtra = axis === "row" ? gap / 2 : xPadding;
      const yExtra = axis === "column" ? gap / 2 : yPadding;
      if (
        event.clientX < rect.left - xExtra ||
        event.clientX > rect.right + xExtra ||
        event.clientY < rect.top - yExtra ||
        event.clientY > rect.bottom + yExtra
      )
        continue;
      const distance =
        axis === "column"
          ? Math.abs(event.clientX - (rect.left + rect.right) / 2)
          : Math.abs(event.clientY - (rect.top + rect.bottom) / 2);
      const previous = matches.get(axis);
      if (!previous || distance < previous.distance)
        matches.set(axis, {
          boundary: { axis, after: Number(child.dataset.after) },
          distance
        });
    }
    const boundaries = [...matches.values()].map(({ boundary }) => boundary);
    if (!boundaries.length) return;
    event.preventDefault();
    event.stopPropagation();
    const document = element.ownerDocument;
    const initial = copyLayout(latest.current);
    const start = { x: event.clientX, y: event.clientY };
    const pointerId = event.pointerId;
    const previousCursor = document.body.style.cursor;
    const previousSelection = document.body.style.userSelect;
    if (!disableCursor)
      document.body.style.cursor =
        boundaries.length === 2
          ? "move"
          : boundaries[0].axis === "column"
            ? "col-resize"
            : "row-resize";
    document.body.style.userSelect = "none";
    const update = (pointer: PointerEvent) => {
      let next = copyLayout(initial);
      for (const boundary of boundaries) {
        const key = boundary.axis === "column" ? "columns" : "rows";
        const pixels =
          boundary.axis === "column"
            ? pointer.clientX - start.x
            : pointer.clientY - start.y;
        if (available[key] > 0)
          next = {
            ...next,
            [key]: resizeAxis(
              initial[key],
              constraints[key],
              boundary.after,
              (100 * pixels) / available[key]
            )
          };
      }
      publish(next, true, false);
    };
    const finish = (cancelled: boolean) => {
      cleanup();
      gesture.current = null;
      setActive([]);
      publish(cancelled ? initial : latest.current, !cancelled, true);
    };
    const move = (pointer: PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      if (pointer.buttons === 0) {
        finish(false);
        return;
      }
      pointer.preventDefault();
      update(pointer);
    };
    const up = (pointer: PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      update(pointer);
      finish(false);
    };
    const cancel = (pointer: PointerEvent) => {
      if (pointer.pointerId === pointerId) finish(true);
    };
    const blur = () => finish(false);
    const cleanup = () => {
      element.removeEventListener("lostpointercapture", blur);
      if (element.hasPointerCapture?.(pointerId))
        element.releasePointerCapture(pointerId);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", cancel);
      document.defaultView?.removeEventListener("blur", blur);
      if (!disableCursor) document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelection;
    };
    gesture.current = { cleanup };
    element.setPointerCapture?.(pointerId);
    element.addEventListener("lostpointercapture", blur);
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", cancel);
    document.defaultView?.addEventListener("blur", blur);
    setActive(boundaries.map(({ axis, after }) => `${axis}:${after}`));
  };

  const template = (tracks: ReturnType<typeof getTracks>, sizes: Layout) =>
    tracks
      .flatMap(({ id }, index) => {
        const size = sizes[id] ?? 100 / tracks.length;
        const track = `minmax(0px, calc(${size}% - ${(gap * (tracks.length - 1) * size) / 100}px))`;
        return index ? [`${gap}px`, track] : [track];
      })
      .join(" ");
  return (
    <GridContext.Provider
      value={{
        id,
        cells,
        layout,
        constraints,
        disabled,
        disableCursor,
        active,
        registerCell,
        registerSeparator,
        resize,
        reset
      }}
    >
      <div
        {...rest}
        id={id}
        data-grid=""
        data-testid={id}
        ref={mergedRef}
        onPointerDownCapture={begin}
        style={{
          width: "100%",
          height: "100%",
          ...style,
          display: "grid",
          position: "relative",
          boxSizing: "border-box",
          padding: 0,
          border: 0,
          direction: "ltr",
          gridTemplateRows: template(rows, layout.rows),
          gridTemplateColumns: template(columns, layout.columns),
          gap: 0
        }}
      >
        {children}
        {(["column", "row"] as const).flatMap((axis) =>
          (axis === "column" ? columns : rows)
            .slice(0, -1)
            .map((_, after) =>
              customSeparators.includes(`${axis}:${after}`) ? null : (
                <GridBoundary
                  key={`${axis}:${after}`}
                  axis={axis}
                  after={after}
                />
              )
            )
        )}
        {rows.slice(0, -1).flatMap((_, row) =>
          columns.slice(0, -1).map((_, column) => {
            const visible =
              getSegments("column", column, rows.length, cells).some(
                ({ start, span }) => start <= row + 1 && start + span > row
              ) &&
              getSegments("row", row, columns.length, cells).some(
                ({ start, span }) =>
                  start <= column + 1 && start + span > column
              );
            return visible ? (
              <div
                key={`${row}:${column}`}
                aria-hidden="true"
                data-grid-intersection=""
                style={{
                  gridRow: row * 2 + 2,
                  gridColumn: column * 2 + 2,
                  touchAction: "none",
                  cursor: disableCursor || disabled ? undefined : "move"
                }}
              />
            ) : null;
          })
        )}
      </div>
    </GridContext.Provider>
  );
}
