import type { PropsWithChildren } from "react";
import {
  Group as GroupExternal,
  type GroupProps
} from "react-resizable-panels";
import { cn } from "../utils/cn";

export function Group({
  className = "",
  ...rest
}: PropsWithChildren<
  GroupProps & {
    className?: string;
  }
>) {
  return <GroupExternal className={cn("p-2 gap-2", className)} {...rest} />;
}
