import { useId, useState } from "react";
import {
  Panel as PanelExternal,
  type PanelProps,
  type PanelSize
} from "react-resizable-panels";
import { PanelText } from "./PanelText";

export function Panel({
  children,
  className = "",
  id: idProp,
  onResize,
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

  return (
    <PanelExternal
      className={`bg-slate-800 rounded rounded-md ${className}`}
      {...rest}
      id={id}
      onResize={(size, id) => {
        setSize(size);
        onResize?.(size, id);
      }}
    >
      <PanelText>
        {children ?? (
          <>
            {`id: ${id}`}
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
          </>
        )}
      </PanelText>
    </PanelExternal>
  );
}
