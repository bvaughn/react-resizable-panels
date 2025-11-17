import { useState } from "react";
import {
  Panel as PanelExternal,
  type PanelSize,
  type PanelProps
} from "react-resizable-panels";
import { PanelText } from "./PanelText";

export function Panel({
  children,
  className = "",
  showSizeAsPercentage,
  showSizeInPixels,
  ...rest
}: PanelProps & {
  showSizeAsPercentage?: boolean;
  showSizeInPixels?: boolean;
}) {
  const [size, setSize] = useState<PanelSize>({
    asPercentage: 0,
    inPixels: 0
  });
  return (
    <PanelExternal
      className={`bg-slate-800 rounded rounded-md ${className}`}
      {...rest}
      onResize={setSize}
    >
      <PanelText>
        {children}

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
