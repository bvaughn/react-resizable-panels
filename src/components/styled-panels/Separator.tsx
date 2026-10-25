import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";
import {
  type Orientation,
  Separator as SeparatorExternal,
  type SeparatorProps
} from "react-resizable-panels";

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
        "bg-separator [&[data-separator='disabled']]:opacity-50 [&[data-separator='hover']]:bg-separator-hover [&[data-separator='active']]:bg-separator-active",
        "text-white/50 [&[data-separator='hover']]:text-white/70 [&[data-separator='active']]:text-white/70",
        useFocusPseudoClasses
          ? "focus-visible:bg-sky-400!"
          : "[&[data-separator='focus']]:bg-sky-400",
        orientation === "horizontal" ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
      {...rest}
    >
      <EllipsisVerticalIcon className="w-6 h-6 sm:w-4 sm:h-4 shrink-0" />
    </SeparatorExternal>
  );
}
