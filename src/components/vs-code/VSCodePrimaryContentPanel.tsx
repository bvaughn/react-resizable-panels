import { DocumentTextIcon } from "@heroicons/react/16/solid";
import { Panel } from "react-resizable-panels";
import { html } from "../../../public/generated/examples/VSCodeEditorFile.json";

const lines = html.split("\n");

export function VSCodePrimaryContentPanel() {
  return (
    <Panel className="bg-ink/8 rounded-md flex flex-col" minSize={100}>
      <div className="flex flex-row shrink-0 border-b border-ink/10">
        <div className="flex flex-row items-center gap-1 px-3 py-1 text-sm border-b-2 border-violet-400 -mb-px">
          <DocumentTextIcon className="w-4 h-4 shrink-0 text-ink/60" />
          App.tsx
        </div>
      </div>
      <div className="grow overflow-auto py-2 font-mono text-xs leading-5">
        {lines.map((line, index) => (
          <div className="flex flex-row whitespace-pre" key={index}>
            <span className="w-8 shrink-0 pr-3 text-right text-ink/40 select-none">
              {index + 1}
            </span>
            <div dangerouslySetInnerHTML={{ __html: line }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}
