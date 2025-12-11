import { useId, useState } from "react";
import {
  Panel as PanelExternal,
  type PanelSize,
  type PanelProps
} from "react-resizable-panels";
import { PanelText } from "./PanelText";

export function Panel({
  children,
  className = "",
  id: idProp,
  showSizeAsPercentage = true,
  showSizeInPixels = true,
  ...rest
}: PanelProps & {
  showSizeAsPercentage?: boolean;
  showSizeInPixels?: boolean;
}) {
  const [size, setSize] = useState<PanelSize>({
    asPercentage: 0,
    inPixels: 0
  });

  const idReact = useId();
  const id = `${idProp ?? idReact}`;

  const listenForResize = showSizeAsPercentage || showSizeInPixels;

  return (
    <PanelExternal
      className={`bg-slate-800 rounded rounded-md ${className}`}
      {...rest}
      onResize={listenForResize ? setSize : undefined}
    >
      <PanelText>
        {children ?? id}
        {showSizeAsPercentage && (
          <div className="text-slate-300 text-xs">
            {Math.round(size.asPercentage)}%
          </div>
        )}
        {showSizeInPixels && (
          <div className="text-slate-300 text-xs">
            {Math.round(size.inPixels)}px
          </div>
        )}
      </PanelText>
    </PanelExternal>
  );
}
