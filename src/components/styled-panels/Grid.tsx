import { cn } from "react-lib-tools";
import { Grid as GridExternal, type GridProps } from "react-resizable-panels";

export function Grid({ className, ...rest }: GridProps) {
  return <GridExternal className={cn("gap-2 sm:gap-1", className)} {...rest} />;
}
