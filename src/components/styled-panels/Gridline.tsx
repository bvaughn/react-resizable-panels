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
        "bg-separator [&[data-separator='hover']]:bg-separator-hover [&[data-separator='active']]:bg-separator-active [&[data-separator='focus']]:bg-sky-400",
        "[&[data-separator='hover']]:z-50 [&[data-separator='active']]:z-50",
        rest.type === "column" ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
      {...rest}
    />
  );
}
