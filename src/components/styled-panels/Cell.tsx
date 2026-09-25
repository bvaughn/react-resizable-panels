import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";
import { Cell as CellExternal, type CellProps } from "react-resizable-panels";
import { PanelText } from "./PanelText";

export function Cell({
  children,
  className,
  ...rest
}: PropsWithChildren<CellProps>) {
  return (
    <CellExternal
      className={cn("bg-slate-800 rounded rounded-md", className)}
      {...rest}
    >
      <PanelText>{children}</PanelText>
    </CellExternal>
  );
}
