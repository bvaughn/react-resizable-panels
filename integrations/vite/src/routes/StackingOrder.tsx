import { useState } from "react";
import type { Layout } from "react-resizable-panels";
import { DebugData } from "../components/DebugData";
import { Group } from "../components/Group";
import { Panel } from "../components/Panel";
import { Separator } from "../components/Separator";

export function StackingOrder() {
  const [state, setState] = useState<{
    onLayoutCount: number;
    layout: Layout;
  }>({
    layout: {},
    onLayoutCount: 0
  });

  return (
    <div className="px-2 py-10 flex flex-col gap-2 h-full">
      <Group
        className="w-25 h-25 min-h-25"
        onLayoutChange={(layout) => {
          setState((prev) => ({
            onLayoutCount: prev.onLayoutCount + 1,
            layout
          }));
        }}
      >
        <Panel>id: left</Panel>
        <Separator id="separator" />
        <Panel>id: center</Panel>
        <Panel>id: right</Panel>
      </Group>
      <div className="absolute left-[33%] ml-[-50px] w-[100px] top-5 bg-slate-300/65 text-slate-800 p-2 rounded text-center text-xs">
        top-left
      </div>
      <div className="absolute left-[66%] ml-[-50px] w-[100px] top-5 bg-slate-300/65 text-slate-800 p-2 rounded text-center text-xs">
        top-right
      </div>
      <div className="absolute left-[33%] ml-[-50px] w-[100px] top-35 bg-slate-300/65 text-slate-800 p-2 rounded text-center text-xs">
        bottom-left
      </div>
      <div className="absolute left-[66%] ml-[-50px] w-[100px] top-35 bg-slate-300/65 text-slate-800 p-2 rounded text-center text-xs">
        bottom-right
      </div>

      <DebugData data={state} />
    </div>
  );
}
