import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";
import {
  Separator as SeparatorExternal,
  type SeparatorProps,
  type Orientation
} from "react-resizable-panels";
import GrabDotsIcon from "../../../public/svgs/grab-dots.svg?react";

export function Separator({
  className = "",
  orientation = "horizontal",
  useFocusPseudoClasses,
  ...rest
}: PropsWithChildren<
  SeparatorProps & {
    orientation?: Orientation;
    useFocusPseudoClasses?: boolean;
  }
>) {
  return (
    <SeparatorExternal
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xs",
        "bg-slate-600 [&[data-separator='disabled']]:opacity-50 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-400",
        "text-slate-900 [&[data-separator='hover']]:text-slate-950 [&[data-separator='active']]:text-slate-950",
        useFocusPseudoClasses
          ? "focus-visible:bg-sky-400!"
          : "[&[data-separator='focus']]:bg-sky-400",
        orientation === "horizontal" ? "w-3.5 sm:w-2.5" : "h-3.5 sm:h-2.5",
        className
      )}
      {...rest}
    >
      <GrabDotsIcon className="size-3.5 sm:size-2.5 shrink-0" />
    </SeparatorExternal>
  );
}
