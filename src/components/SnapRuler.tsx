import {
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { cn } from "react-lib-tools";

type Axis = "horizontal" | "vertical";

type Marker = {
  active: boolean;
  position: number;
  size: number;
};

type Measurement = {
  // Total size of the tracks/panels (excluding separators and gaps), in pixels
  available: number;
  // Current size of the first track/panel, as a percentage
  current: number;
  // Where the first boundary's center is (relative to the ruler) when the first track/panel is empty, in pixels
  offset: number;
};

// Demo-only helper (not part of the library) that shows where the first boundary of a Group, Grid, or Workspace snaps to,
// as percentages of the first panel/track's size: columns (or a horizontal Group) above it, and rows to its right
export function SnapRuler({
  children,
  horizontal,
  vertical
}: PropsWithChildren<{
  horizontal?: number[];
  vertical?: number[];
}>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const horizontalRulerRef = useRef<HTMLDivElement>(null);
  const verticalRulerRef = useRef<HTMLDivElement>(null);
  const [horizontalMarkers, setHorizontalMarkers] = useState<Marker[]>([]);
  const [verticalMarkers, setVerticalMarkers] = useState<Marker[]>([]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => update());

    const update = () => {
      const target = content.querySelector<HTMLElement>(
        "[data-grid], [data-group]"
      );
      if (!target) {
        return;
      }

      // Panels and cells can be replaced (e.g. when a workspace is reset), so they're re-observed on each update
      resizeObserver.observe(target);
      Array.from(target.children).forEach((child) =>
        resizeObserver.observe(child)
      );

      const axes = [
        [horizontal, horizontalRulerRef.current, setHorizontalMarkers],
        [vertical, verticalRulerRef.current, setVerticalMarkers]
      ] as const;
      axes.forEach(([snapSizes, ruler, setMarkers], index) => {
        if (!snapSizes || !ruler) {
          return;
        }

        const axis: Axis = index === 0 ? "horizontal" : "vertical";
        const measurement = target.hasAttribute("data-grid")
          ? measureGrid(target, ruler, axis)
          : measureGroup(target, ruler, axis);
        if (!measurement) {
          return;
        }

        const { available, current, offset } = measurement;
        setMarkers(
          snapSizes.map((size) => ({
            active: Math.abs(current - size) < 0.5,
            position: Math.round(offset + (available * size) / 100),
            size
          }))
        );
      });
    };

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(content, { childList: true, subtree: true });

    update();

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [horizontal, vertical]);

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: vertical ? "1fr auto" : "1fr" }}
    >
      {horizontal && (
        <div
          aria-hidden
          className="relative h-6 border-b border-dashed border-ink/20 text-xs select-none"
          ref={horizontalRulerRef}
        >
          {horizontalMarkers.map(({ active, position, size }) => (
            <div
              className={cn(
                "absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-colors",
                getTextClassName(active)
              )}
              key={size}
              style={{ left: position }}
            >
              <span className="leading-none">{size}%</span>
              <span
                className={cn(
                  "mt-0.5 h-1.5 w-0.5 rounded-t-xs",
                  getTickClassName(active)
                )}
              />
            </div>
          ))}
        </div>
      )}
      {horizontal && vertical && <div />}
      <div className="min-w-0" ref={contentRef}>
        {children}
      </div>
      {vertical && (
        <div
          aria-hidden
          className="relative w-10 border-l border-dashed border-ink/20 text-xs select-none"
          ref={verticalRulerRef}
        >
          {verticalMarkers.map(({ active, position, size }) => (
            <div
              className={cn(
                "absolute left-0 flex -translate-y-1/2 flex-row items-center transition-colors",
                getTextClassName(active)
              )}
              key={size}
              style={{ top: position }}
            >
              <span
                className={cn(
                  "mr-1 h-0.5 w-1.5 rounded-r-xs",
                  getTickClassName(active)
                )}
              />
              <span className="leading-none">{size}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTextClassName(active: boolean) {
  return active ? "text-violet-600 dark:text-violet-400" : "text-ink/50";
}

function getTickClassName(active: boolean) {
  return active ? "bg-violet-600 dark:bg-violet-400" : "bg-ink/40";
}

function getStart(rect: DOMRect, axis: Axis) {
  return axis === "horizontal" ? rect.left : rect.top;
}

function getEnd(rect: DOMRect, axis: Axis) {
  return axis === "horizontal" ? rect.right : rect.bottom;
}

function getSize(rect: DOMRect, axis: Axis) {
  return axis === "horizontal" ? rect.width : rect.height;
}

// Grid tracks are sized by its template, with either gaps or gutters (Gridlines) between them
function measureGrid(
  grid: HTMLElement,
  ruler: HTMLElement,
  axis: Axis
): Measurement | undefined {
  const style = getComputedStyle(grid);
  const values = (
    axis === "horizontal" ? style.gridTemplateColumns : style.gridTemplateRows
  )
    .split(" ")
    .map(parseFloat);

  // Column gridlines are vertical and row gridlines are horizontal
  const hasGutters =
    grid.querySelector(
      `:scope > [data-separator][aria-orientation="${axis === "horizontal" ? "vertical" : "horizontal"}"]`
    ) !== null;
  const tracks = hasGutters
    ? values.filter((_, index) => index % 2 === 0)
    : values;
  const separatorSize = hasGutters
    ? values[1]
    : parseFloat(axis === "horizontal" ? style.columnGap : style.rowGap) || 0;

  const available = tracks.reduce((total, size) => total + size, 0);
  if (!available) {
    return;
  }

  const padding =
    axis === "horizontal"
      ? parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth)
      : parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth);

  return {
    available,
    current: (tracks[0] / available) * 100,
    offset:
      getStart(grid.getBoundingClientRect(), axis) -
      getStart(ruler.getBoundingClientRect(), axis) +
      padding +
      separatorSize / 2
  };
}

// Groups (including the splits of a Workspace) size their panels directly, with separators between them
function measureGroup(
  group: HTMLElement,
  ruler: HTMLElement,
  axis: Axis
): Measurement | undefined {
  const panels = Array.from(group.children).filter((child) =>
    child.hasAttribute("data-panel")
  );
  const separator = group.querySelector(":scope > [data-separator]");
  if (panels.length === 0 || !separator) {
    return;
  }

  const available = panels.reduce(
    (total, panel) => total + getSize(panel.getBoundingClientRect(), axis),
    0
  );
  if (!available) {
    return;
  }

  const firstRect = panels[0].getBoundingClientRect();
  const separatorRect = separator.getBoundingClientRect();

  return {
    available,
    current: (getSize(firstRect, axis) / available) * 100,
    offset:
      getStart(firstRect, axis) -
      getStart(ruler.getBoundingClientRect(), axis) +
      (getStart(separatorRect, axis) +
        getSize(separatorRect, axis) / 2 -
        getEnd(firstRect, axis))
  };
}
