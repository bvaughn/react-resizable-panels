import { cn } from "react-lib-tools";
import { Grid as GridExternal, type GridProps } from "react-resizable-panels";

// Grid geometry is specified with inline styles (rather than CSS classes)
// so that tests can make exact assertions about track sizes:
// e.g. 808px wide with an 8px gap between 2 columns leaves 800px for the columns
export const GRID_GAP = 8;

export function Grid({ className = "", style, ...rest }: GridProps) {
  return (
    <GridExternal
      className={cn("bg-slate-950", className)}
      style={{
        gap: GRID_GAP,
        height: 408,
        width: 808,
        ...style
      }}
      {...rest}
    />
  );
}
