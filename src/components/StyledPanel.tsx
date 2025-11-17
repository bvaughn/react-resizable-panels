import { useState, type ComponentProps, type PropsWithChildren } from "react";
import { Panel } from "react-resizable-panels";

export function StyledPanel({
  children,
  className = "",
  showSize,
  ...rest
}: PropsWithChildren<
  Omit<ComponentProps<typeof Panel>, "onResize"> & {
    id?: string;
    showSize?: boolean;
  }
>) {
  const [size, setSize] = useState({
    asPercentage: 0,
    inPixels: 0
  });

  return (
    <Panel
      className={`overflow-hidden bg-gray-700 ${className}`}
      {...rest}
      onResize={setSize}
    >
      <div className="flex flex-col align-center justify-center gap-1 text-center rounded p-2 whitespace-pre h-full">
        <div className="text-xl">{children}</div>
        {showSize && (
          <>
            <div className="text-sm">{Math.round(size.inPixels)}px</div>
            <div className="text-sm">
              {Math.round(size.asPercentage * 100)}%
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
