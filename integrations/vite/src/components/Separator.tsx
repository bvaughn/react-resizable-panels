import type { PropsWithChildren } from "react";
import {
  Separator as SeparatorExternal,
  type Orientation,
  type SeparatorProps
} from "react-resizable-panels";
import { cn } from "../utils/cn";

export function Separator({
  className = "",
  orientation = "horizontal",
  ...rest
}: PropsWithChildren<
  SeparatorProps & {
    className?: string;
    orientation?: Orientation;
  }
>) {
  return (
    <SeparatorExternal
      className={cn(
        "shrink-0 rounded rounded-xs",
        "bg-slate-600 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-400",
        "text-slate-900 [&[data-separator='hover']]:text-slate-950 [&[data-separator='active']]:text-slate-950",
        "focus:bg-slate-400",
        orientation === "horizontal" ? "w-2" : "h-2",
        className
      )}
      {...rest}
    >
      &nbsp;
    </SeparatorExternal>
  );
}
