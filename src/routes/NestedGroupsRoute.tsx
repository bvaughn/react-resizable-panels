import { Box, Code, Header } from "react-lib-tools";
import { useState } from "react";
import { Panel, type PanelProps } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/examples/NestedGroups.json";
import { Group } from "../components/styled-panels/Group";
import { Panel as PreStyledPanel } from "../components/styled-panels/Panel";
import { PanelText } from "../components/styled-panels/PanelText";

export default function NestedGroupsRoute() {
  const [mode, setMode] = useState<PanelProps["mode"]>("freeze");
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Nested groups" />
      <div>
        Panel groups can be nested. In this configuration, multiple groups can
        be resized at the same time by clicking near panel intersections.
      </div>
      <Code html={ExampleHTML} />
      <fieldset>
        <legend className="mb-2">First panel resize mode</legend>
        <div className="inline-flex rounded border border-slate-600 bg-slate-800 p-1">
          {([undefined, "freeze", "preview"] as const).map((value) => (
            <label
              key={value ?? "live"}
              className="cursor-pointer touch-manipulation"
            >
              <input
                type="radio"
                name="panel-resize-mode"
                value={value ?? "live"}
                className="peer sr-only"
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span className="block rounded px-3 py-2 hover:bg-slate-700 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-300">
                {value === "freeze"
                  ? "Freeze content"
                  : value === "preview"
                    ? "Preview divider"
                    : "Live"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Group className="h-50!" data-resize-example>
        <Panel minSize={50} mode={mode} className="rounded bg-slate-800 p-2">
          <table className="w-full text-left text-sm">
            <caption>Service activity</caption>
            <tbody>
              {Array.from({ length: 1000 }, (_, index) => (
                <tr key={index}>
                  <td className="p-1">Service {index + 1}</td>
                  <td className="p-1">Processing incoming requests</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel minSize={200}>
          <Group orientation="vertical">
            <PreStyledPanel minSize={20}>
              <PanelText>top</PanelText>
            </PreStyledPanel>
            <Panel minSize={20}>
              <Group>
                <PreStyledPanel minSize={50}>
                  <PanelText>left</PanelText>
                </PreStyledPanel>
                <PreStyledPanel minSize={50}>
                  <PanelText>right</PanelText>
                </PreStyledPanel>
              </Group>
            </Panel>
          </Group>
        </Panel>
        <PreStyledPanel minSize={50}>
          <PanelText>right</PanelText>
        </PreStyledPanel>
      </Group>
    </Box>
  );
}
