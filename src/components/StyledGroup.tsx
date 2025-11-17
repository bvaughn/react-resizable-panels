import type { PropsWithChildren } from "react";
import { Group, type Direction } from "react-resizable-panels";

export function StyledGroup({
  children,
  className = "",
  direction = "horizontal"
}: PropsWithChildren<{
  className?: string;
  direction?: Direction;
}>) {
  return (
    <Group
      className={`w-full gap-2 rounded rounded-lg data-[Group-resizing]:border-gray-500 ${className}`}
      direction={direction}
    >
      {children}
    </Group>
  );
}
