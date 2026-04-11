import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";
import {
  Separator as SeparatorExternal,
  type SeparatorProps,
  type Orientation
} from "react-resizable-panels";
import GrabDotsIcon from "../../../public/svgs/grab-dots.svg?react";

export function Separator({
  className = "",
  orientation = "horizontal",
  ...rest
}: PropsWithChildren<
  SeparatorProps & {
    orientation?: Orientation;
  }
>) {
  return (
    <SeparatorExternal
      className={cn(
        "rounded rounded-xs flex items-center justify-center",
        "bg-slate-600 [&[data-separator='disabled']]:opacity-50 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-400",
        "text-slate-900 [&[data-separator='hover']]:text-slate-950 [&[data-separator='active']]:text-slate-950",
        "[&[data-separator='focus']]:bg-sky-400",
        orientation === "horizontal" ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
      {...rest}
    >
      <GrabDotsIcon className="w-6 h-6 sm:w-4 sm:h-4 shrink-0" />
    </SeparatorExternal>
  );
}
