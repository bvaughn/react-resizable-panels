import {
  Panel as PanelExternal,
  type PanelProps
} from "react-resizable-panels";
import { Text } from "../Text";

export function Panel({
  children,
  className = "",
  minimal,
  ...rest
}: PanelProps & {
  minimal?: boolean;
}) {
  return (
    <PanelExternal
      className={`${minimal ? "" : "border border-2 border-slate-700 rounded rounded-md"} ${className}`}
      {...rest}
    >
      <Text>{children}</Text>
    </PanelExternal>
  );
}
