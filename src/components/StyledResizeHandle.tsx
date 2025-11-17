import type { PropsWithChildren } from "react";
import { ResizeHandle, type Direction } from "react-resizable-panels";

export function StyledResizeHandle({
  children,
  className = "",
  direction = "horizontal"
}: PropsWithChildren<{
  className?: string;
  direction?: Direction;
}>) {
  return (
    <ResizeHandle
      className={`rounded bg-gray-500 data-[resize-handle-state]:bg-gray-300 ${direction === "horizontal" ? "w-1" : "h-1"} ${className}`}
    >
      {children}
    </ResizeHandle>
  );
}
