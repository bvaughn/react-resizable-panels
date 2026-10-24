import { useState } from "react";
import { cn } from "react-lib-tools";
import {
  Panel as PanelExternal,
  type PanelProps,
  type PanelSize
} from "react-resizable-panels";
import { PanelText } from "./PanelText";

export function Panel({
  children,
  className = "",
  disabled,
  onResize,
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
        "bg-white/8 rounded-md",
        disabled && "opacity-65",
        className
      )}
      disabled={disabled}
      {...rest}
      onResize={
        listenForResize || onResize
          ? (size, id, prevSize) => {
              if (listenForResize) {
                setSize(size);
              }
              onResize?.(size, id, prevSize);
            }
          : undefined
      }
    >
      <PanelText>
        {children}

        {showSizeAsPercentage && (
          <div className="text-white/60 text-xs">
            {Math.round(size.asPercentage)}%
          </div>
        )}
        {showSizeInPixels && (
          <div className="text-white/60 text-xs">
            {Math.round(size.inPixels)}px
          </div>
        )}
      </PanelText>
    </PanelExternal>
  );
}
