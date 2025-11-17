import { useState } from "react";
import type { Layout } from "react-resizable-panels";
import { Group, Panel, type PanelSize } from "../../lib";
import { html as MinMaxExampleHTML } from "../../public/generated/code-snippets/SizeConstraintsMinMax.json";
import { html as PercentageExampleHTML } from "../../public/generated/code-snippets/SizeConstraintsPercentage.json";
import { Box } from "../components/Box";
import { Callout } from "../components/Callout";
import { Code } from "../components/code/Code";
import { ExternalLink } from "../components/ExternalLink";
import { Header } from "../components/Header";
import { Text } from "../components/Text";

export default function SizeConstraintsRoute() {
  const [size, setSize] = useState<PanelSize>({
    asPercentage: 0,
    inPixels: 0
  });
  const [layout, setLayout] = useState<Layout>({});

  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Min/max sizes" />
      <div>
        Panels can be configured with minimum/maximum allowed sizes. Size can be
        specified using the following{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units">
          CSS units
        </ExternalLink>
        :
      </div>
      <ul className="pl-8">
        <li className="list-disc">Pixels</li>
        <li className="list-disc">Percentages</li>
        <li className="list-disc">Font sizes (em, rem)</li>
        <li className="list-disc">Viewport sizes (vh, vw)</li>
      </ul>
      <div>
        For example, the left panel below only allows itself to be resized
        between 100-200 pixels.
      </div>
      <Group className="h-15 gap-1">
        <Panel
          className="border border-2 border-slate-700 rounded"
          minSize={100}
          maxSize={200}
          onResize={setSize}
        >
          <Text>
            left
            <small>({Math.round(size.inPixels)}px)</small>
          </Text>
        </Panel>
        <Panel className="border border-2 border-slate-700 rounded">
          <Text>right</Text>
        </Panel>
      </Group>
      <Code html={MinMaxExampleHTML} />
      <div>
        As another example, this panel group will not allow any individual panel
        to be smaller than 10% of the group's width.
      </div>
      <Group className="h-15 gap-1" onLayoutChange={setLayout}>
        <Panel
          className="border border-2 border-slate-700 rounded"
          id="left"
          minSize="10%"
        >
          <Text>
            left
            <small>({Math.round(layout.left)}%)</small>
          </Text>
        </Panel>
        <Panel
          className="border border-2 border-slate-700 rounded"
          id="middle"
          minSize="10%"
        >
          <Text>
            middle
            <small>({Math.round(layout.middle)}%)</small>
          </Text>
        </Panel>
        <Panel
          className="border border-2 border-slate-700 rounded"
          id="right"
          minSize="10%"
        >
          <Text>
            right
            <small>({Math.round(layout.right)}%)</small>
          </Text>
        </Panel>
      </Group>
      <Code html={PercentageExampleHTML} />
      <div>When specifying sizes, remember:</div>
      <ul className="pl-8">
        <li className="list-disc">Numbers are evaluated as pixels.</li>
        <li className="list-disc">
          Strings are evaluated as percentages (0..100%) unless otherwise
          specified.
        </li>
      </ul>
      <Callout intent="primary">
        You can always include the unit, even for pixels (e.g. {CODE_A}) or
        percentages (e.g. {CODE_B})
      </Callout>
    </Box>
  );
}

const CODE_A = (
  <code>
    <span className="tok-propertyName">minSize</span>
    <span className="tok-operator">=</span>
    <span className="tok-string">"100px"</span>
  </code>
);

const CODE_B = (
  <code>
    <span className="tok-propertyName">minSize</span>
    <span className="tok-operator">=</span>
    <span className="tok-string">"10%"</span>
  </code>
);
