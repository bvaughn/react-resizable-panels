import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";
import {
  Group as GroupExternal,
  type GroupProps
} from "react-resizable-panels";

export function Group({
  className = "",
  ...rest
}: PropsWithChildren<
  GroupProps & {
    className?: string | undefined;
  }
>) {
  return (
    <GroupExternal
      className={cn("gap-2 min-h-[250px] min-w-full", className)}
      {...rest}
    />
  );
}
