import { cn } from "react-lib-tools";
import {
  Gridline as GridlineExternal,
  type GridlineProps
} from "react-resizable-panels";

// Gridline size is specified with an inline style so that tests can make exact assertions about track sizes
export const GRIDLINE_SIZE = 8;

export function Gridline({ className = "", style, ...rest }: GridlineProps) {
  return (
    <GridlineExternal
      className={cn(
        "rounded rounded-xs overflow-hidden",
        "bg-slate-600 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-300",
        className
      )}
      style={{
        [rest.type === "column" ? "width" : "height"]: GRIDLINE_SIZE,
        ...style
      }}
      {...rest}
    />
  );
}
