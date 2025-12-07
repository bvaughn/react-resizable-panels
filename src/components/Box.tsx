import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Box({
  align,
  children,
  className,
  direction,
  gap = 0,
  grow,
  justify,
  shrink,
  style,
  wrap,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  align?: "center" | "end" | "start" | "stretch" | undefined;
  className?: string | undefined;
  direction: "column" | "row";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | undefined;
  grow?: 0 | 1 | undefined;
  justify?:
    | "around"
    | "between"
    | "center"
    | "end"
    | "start"
    | "stretch"
    | undefined;
  shrink?: 0 | 1 | undefined;
  style?: CSSProperties | undefined;
  wrap?: boolean | undefined;
}) {
  return (
    <div
      className={cn(
        "flex",
        {
          // align
          "items-center": align === "center",
          "items-end": align === "end",
          "items-start": align === "start",
          "items-stretch": align === "stretch",

          // direction
          "flex-col": direction === "column",
          "flex-row": direction === "row",

          // gap
          "gap-1": gap === 1,
          "gap-2": gap === 2,
          "gap-3": gap === 3,
          "gap-4": gap === 4,
          "gap-5": gap === 5,
          "gap-6": gap === 6,
          "gap-7": gap === 7,
          "gap-8": gap === 8,

          // grow
          "grow-0": grow === 0,
          "grow-1": grow === 1,

          // justify
          "justify-around": justify === "around",
          "justify-between": justify === "between",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-start": justify === "start",
          "justify-stretch": justify === "stretch",

          // shrink
          "shrink-0": shrink === 0,
          "shrink-1": shrink === 1,

          // wrap
          "flex-wrap": wrap
        },
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
