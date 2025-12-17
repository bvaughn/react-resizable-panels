import {
  Group as GroupExternal,
  type GroupProps
} from "react-resizable-panels";
import { cn } from "../../utils/cn";

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
