import type { PropsWithChildren } from "react";
import {
  ResizeHandle as ResizeHandleExternal,
  type Direction
} from "react-resizable-panels";
import { cn } from "../../utils/cn";
import GrabDotsIcon from "../../../public/svgs/grab-dots.svg?react";

export function ResizeHandle({
  className = "",
  direction = "horizontal"
}: PropsWithChildren<{
  className?: string;
  direction?: Direction;
}>) {
  return (
    <ResizeHandleExternal
      className={cn(
        "rounded rounded-xs flex items-center justify-center",
        "bg-slate-600 [&[data-resize-handle-state='hover']]:bg-slate-500 [&[data-resize-handle-state='active']]:bg-slate-400",
        "text-slate-900 [&[data-resize-handle-state='hover']]:text-slate-950 [&[data-resize-handle-state='active']]:text-slate-950",
        direction === "horizontal" ? "w-3" : "h-3",
        className
      )}
    >
      <GrabDotsIcon className="w-4 h-4 shrink-0" />
    </ResizeHandleExternal>
  );
}
