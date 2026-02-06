import { useState, type PropsWithChildren } from "react";
import { Panel } from "react-resizable-panels";

export function AccordionPanel({
  children,
  index
}: PropsWithChildren<{
  index: number;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Panel
      className="flex flex-row rounded bg-slate-700"
      disabled={isCollapsed}
      id={"" + index}
      maxSize={isCollapsed ? 18 : undefined}
      minSize={isCollapsed ? 18 : 100}
    >
      <div
        className="bg-slate-600 rounded px-1 h-full w-6 shrink-0 text-center cursor-pointer"
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
      >
        {index}
      </div>
      {isCollapsed || (
        <div className="w-full overflow-hidden flex items-center justify-center">
          {children}
        </div>
      )}
    </Panel>
  );
}
