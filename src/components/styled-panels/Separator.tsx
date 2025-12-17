import type { PropsWithChildren } from "react";
import {
  Separator as SeparatorExternal,
  type Orientation
} from "react-resizable-panels";
import { cn } from "../../utils/cn";
import GrabDotsIcon from "../../../public/svgs/grab-dots.svg?react";

export function Separator({
  className = "",
  orientation = "horizontal"
}: PropsWithChildren<{
  className?: string;
  orientation?: Orientation;
}>) {
  return (
    <SeparatorExternal
      className={cn(
        "rounded rounded-xs flex items-center justify-center",
        "bg-slate-600 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-400",
        "text-slate-900 [&[data-separator='hover']]:text-slate-950 [&[data-separator='active']]:text-slate-950",
        "focus:bg-slate-400",
        orientation === "horizontal" ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
    >
      <GrabDotsIcon className="w-6 h-6 sm:w-3 sm:h-3 shrink-0" />
    </SeparatorExternal>
  );
}
