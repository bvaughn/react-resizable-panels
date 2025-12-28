import { cn } from "react-lib-tools";
import {
  Group as GroupExternal,
  type GroupProps
} from "react-resizable-panels";

export function Group({
  className = "",
  ...rest
}: GroupProps & {
  className?: string;
}) {
  return (
    <GroupExternal className={cn("gap-2 sm:gap-1", className)} {...rest} />
  );
}
