import { html as MinMaxExampleHTML } from "../../public/generated/examples/SizeConstraintsMinMax.json";
import { html as PercentageExampleHTML } from "../../public/generated/examples/SizeConstraintsPercentage.json";
import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function SizeConstraintsRoute() {
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
        between 10v0-200 pixels.
      </div>
      <Code html={MinMaxExampleHTML} />
      <Group className="h-15">
        <Panel minSize={100} maxSize={200} showSizeInPixels>
          left
        </Panel>
        <Separator />
        <Panel>right</Panel>
      </Group>
      <div>
        As another example, this panel group will not allow any individual panel
        to be smaller than 10% of the group's width.
      </div>
      <Code html={PercentageExampleHTML} />
      <Group className="h-15">
        <Panel id="left" minSize="10%" showSizeAsPercentage>
          left
        </Panel>
        <Separator />
        <Panel id="middle" minSize="10%" showSizeAsPercentage>
          middle
        </Panel>
        <Separator />
        <Panel id="right" minSize="10%" showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <Callout intent="primary">
        <div>When specifying sizes, remember:</div>
        <ul className="pl-8 mt-1 mb-1">
          <li className="list-disc">Numbers are evaluated as pixels.</li>
          <li className="list-disc">
            Strings are evaluated as percentages (0..100%) unless otherwise
            specified.
          </li>
        </ul>
        <div>
          You can always include the unit, even for pixels (e.g. {CODE_A}) or
          percentages (e.g. {CODE_B})
        </div>
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
