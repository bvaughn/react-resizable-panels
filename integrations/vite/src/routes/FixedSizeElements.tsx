import { useState } from "react";
import type { Layout } from "react-resizable-panels";
import { DebugData } from "../components/DebugData";
import { Group } from "../components/Group";
import { Panel } from "../components/Panel";
import { Separator } from "../components/Separator";

export function FixedSizeElements() {
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
        <Panel id="foo">id: foo</Panel>
        <Between>foo+bar</Between>
        <Panel id="bar">id: bar</Panel>
        <Separator id="bar+baz" />
        <Between>bar+baz</Between>
        <Panel id="baz">id: baz</Panel>
        <Separator id="baz+qux+left" />
        <Between>baz+qux</Between>
        <Separator id="baz+qux+right" />
        <Panel id="qux">id: qux</Panel>
      </Group>

      <DebugData data={state} />
    </div>
  );
}

function Between({ children }: { children: string }) {
  return (
    <div className="bg-slate-300 text-slate-800 rounded p-1 text-xs flex items-center justify-center">
      {children}
    </div>
  );
}
