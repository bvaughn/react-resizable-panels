import { cn } from "react-lib-tools";
import { Cell as CellExternal, type CellProps } from "react-resizable-panels";
import { PanelText } from "./PanelText";

export function Cell({ children, className = "", id, ...rest }: CellProps) {
  return (
    <CellExternal
      className={cn("bg-slate-800 rounded rounded-md", className)}
      id={id}
      {...rest}
    >
      {children ?? <PanelText>{`id: ${id}`}</PanelText>}
    </CellExternal>
  );
}
