import { useState } from "react";
import { cn } from "react-lib-tools";
import {
  Grid as GridExternal,
  type GridLayout,
  type GridProps
} from "react-resizable-panels";
import { GridSizesContext } from "./GridSizesContext";

export function Grid({
  className,
  onLayoutChange,
  showSizes = false,
  ...rest
}: GridProps & {
  showSizes?: boolean;
}) {
  const [sizes, setSizes] = useState<{ columns: number[]; rows: number[] }>({
    columns: [],
    rows: []
  });

  return (
    <GridSizesContext value={showSizes ? sizes : undefined}>
      <GridExternal
        className={cn("gap-2 sm:gap-1", className)}
        onLayoutChange={(layout: GridLayout) => {
          if (showSizes) {
            setSizes({
              columns: toSizesByIndex(rest.columns, layout.columns),
              rows: toSizesByIndex(rest.rows, layout.rows)
            });
          }
          onLayoutChange?.(layout);
        }}
        {...rest}
      />
    </GridSizesContext>
  );
}

// Layouts are keyed by track id; tracks without an explicit id use their index
function toSizesByIndex(
  tracks: GridProps["columns"],
  layout: { [id: string]: number }
) {
  const ids =
    typeof tracks === "number"
      ? Array.from({ length: tracks }, (_, index) => String(index))
      : tracks.map((track, index) => String(track.id ?? index));

  return ids.map((id) => layout[id] ?? 0);
}
