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
        "bg-slate-600 [&[data-separator-state='hover']]:bg-slate-500 [&[data-separator-state='active']]:bg-slate-400",
        "text-slate-900 [&[data-separator-state='hover']]:text-slate-950 [&[data-separator-state='active']]:text-slate-950",
        orientation === "horizontal" ? "w-3" : "h-3",
        className
      )}
    >
      <GrabDotsIcon className="w-4 h-4 shrink-0" />
    </SeparatorExternal>
  );
}
