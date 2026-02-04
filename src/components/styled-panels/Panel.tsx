import { useState } from "react";
import {
  Panel as PanelExternal,
  type PanelSize,
  type PanelProps
} from "react-resizable-panels";
import { PanelText } from "./PanelText";
import { cn } from "react-lib-tools";

export function Panel({
  children,
  className = "",
  disabled,
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

  const listenForResize = showSizeAsPercentage || showSizeInPixels;

  return (
    <PanelExternal
      className={cn(
        "bg-slate-800 rounded rounded-md overflow-auto",
        disabled && "opacity-65",
        className
      )}
      disabled={disabled}
      {...rest}
      onResize={listenForResize ? setSize : undefined}
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
