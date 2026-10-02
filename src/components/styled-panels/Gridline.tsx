import { cn } from "react-lib-tools";
import {
  Gridline as GridlineExternal,
  type GridlineProps
} from "react-resizable-panels";

export function Gridline({ className, ...rest }: GridlineProps) {
  return (
    <GridlineExternal
      className={cn(
        "rounded-xs",
        "bg-white/20 [&[data-separator='hover']]:bg-white/35 [&[data-separator='active']]:bg-white/50 [&[data-separator='focus']]:bg-sky-400",
        "[&[data-separator='hover']]:z-50 [&[data-separator='active']]:z-50",
        rest.type === "column" ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
      {...rest}
    />
  );
}
