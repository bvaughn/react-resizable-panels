import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";
import {
  Separator as SeparatorExternal,
  type SeparatorProps
} from "react-resizable-panels";

export function Separator({
  className = "",
  ...rest
}: PropsWithChildren<
  SeparatorProps & {
    className?: string | undefined;
  }
>) {
  return (
    <SeparatorExternal
      className={cn(
        "min-h-2 min-w-2 shrink-0 rounded rounded-xs overflow-hidden",
        "bg-slate-600 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-400",
        "text-slate-900 [&[data-separator='hover']]:text-slate-950 [&[data-separator='active']]:text-slate-950",
        "focus:bg-slate-400",
        className
      )}
      {...rest}
    >
      &nbsp;
    </SeparatorExternal>
  );
}
