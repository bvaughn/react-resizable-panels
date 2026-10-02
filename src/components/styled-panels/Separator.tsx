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
        "rounded-xs flex items-center justify-center",
        "bg-white/20 [&[data-separator='disabled']]:opacity-50 [&[data-separator='hover']]:bg-white/35 [&[data-separator='active']]:bg-white/50",
        "text-black/50 [&[data-separator='hover']]:text-black/70 [&[data-separator='active']]:text-black/70",
        useFocusPseudoClasses
          ? "focus-visible:bg-sky-400!"
          : "[&[data-separator='focus']]:bg-sky-400",
        orientation === "horizontal" ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
      {...rest}
    >
      <GrabDotsIcon className="w-6 h-6 sm:w-4 sm:h-4 shrink-0" />
    </SeparatorExternal>
  );
}
