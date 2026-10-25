import { type PropsWithChildren, useContext } from "react";
import { cn } from "react-lib-tools";
import { Cell as CellExternal, type CellProps } from "react-resizable-panels";
import { GridSizesContext } from "./GridSizesContext";
import { PanelText } from "./PanelText";

export function Cell({
  children,
  className,
  ...rest
}: PropsWithChildren<CellProps>) {
  const sizes = useContext(GridSizesContext);

  return (
    <CellExternal className={cn("bg-ink/8 rounded-md", className)} {...rest}>
      <PanelText>
        {children}
        {sizes && (
          <div className="text-ink/60 text-xs text-center">
            {sumSpan(sizes.columns, rest.column, rest.columnSpan)}% ×{" "}
            {sumSpan(sizes.rows, rest.row, rest.rowSpan)}%
          </div>
        )}
      </PanelText>
    </CellExternal>
  );
}

// Cells that span multiple tracks are as big as all of those tracks combined
function sumSpan(sizes: number[], start: number, span = 1) {
  return Math.round(
    sizes.slice(start, start + span).reduce((total, size) => total + size, 0)
  );
}
