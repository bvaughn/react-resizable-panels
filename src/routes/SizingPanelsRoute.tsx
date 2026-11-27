import {
  Box,
  Callout,
  Code,
  ExternalLink,
  Header,
  SectionHeader
} from "react-lib-tools";
import { useGroupRef, usePanelRef } from "react-resizable-panels";
import { html as DefaultSizeHTML } from "../../public/generated/examples/SizingPanelsDefaultSize.json";
import { html as ImperativeHTML } from "../../public/generated/examples/SizingPanelsImperative.json";
import { DemoButton } from "../components/DemoButton";
import { Link } from "../components/Link";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function SizingPanelsRoute() {
  const groupRef = useGroupRef();
  const panelRef = usePanelRef();

  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Sizing panels" />
      <div>
        A group's layout is the size of each of its panels, as a percentage of
        the group. The <code>defaultSize</code> prop sets a panel's initial
        size; panels without one share the rest of the group.
      </div>
      <Code html={DefaultSizeHTML} />
      <Group>
        <Panel defaultSize="250px" showSizeInPixels>
          left
        </Panel>
        <Separator />
        <Panel showSizeAsPercentage>center</Panel>
        <Separator />
        <Panel defaultSize="25%" showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <SectionHeader>Units</SectionHeader>
      <div>
        Sizes (including <Link to="/examples/min-max-sizes">min/max</Link>,{" "}
        <Link to="/examples/collapsible-panels">collapsed</Link>, and{" "}
        <Link to="/examples/snap-sizes">snap</Link> sizes) can be specified
        using the following{" "}
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
      <SectionHeader>Resizing panels</SectionHeader>
      <div>
        Users resize panels by dragging the separators (or borders) between
        them. Double-clicking a separator resets the panel next to it to its{" "}
        <code>defaultSize</code>. Separators can also be focused and moved with
        the keyboard: the arrow keys move a separator in steps, Home and End
        move it as far as it can go, and Enter collapses or expands a{" "}
        <Link to="/examples/collapsible-panels">collapsible panel</Link>.
      </div>
      <div>
        Panels can also be resized programmatically, using the{" "}
        <Link to="/imperative-api/panel">Panel</Link> and{" "}
        <Link to="/imperative-api/group">Group</Link> imperative APIs:
      </div>
      <Code html={ImperativeHTML} />
      <div className="flex flex-wrap gap-2">
        <DemoButton onClick={() => panelRef.current?.resize("200px")}>
          sidebar 200px
        </DemoButton>
        <DemoButton
          onClick={() => groupRef.current?.setLayout({ left: 50, right: 50 })}
        >
          reset
        </DemoButton>
      </div>
      <Group groupRef={groupRef}>
        <Panel id="left" panelRef={panelRef} showSizeInPixels>
          left
        </Panel>
        <Separator />
        <Panel id="right" showSizeAsPercentage>
          right
        </Panel>
      </Group>
      <SectionHeader>Limiting sizes</SectionHeader>
      <ul className="pl-8">
        <li className="list-disc">
          <Link to="/examples/min-max-sizes">Min/max sizes</Link> keep panels
          within a range of sizes.
        </li>
        <li className="list-disc">
          <Link to="/examples/collapsible-panels">Collapsible panels</Link> can
          be collapsed when they're resized below their minimum size.
        </li>
        <li className="list-disc">
          <Link to="/examples/snap-sizes">Snap sizes</Link> limit panels to a
          set of sizes.
        </li>
        <li className="list-disc">
          <Link to="/examples/group-resize-behavior">
            Group resize behavior
          </Link>{" "}
          keeps panels at their pixel sizes when their group is resized.
        </li>
      </ul>
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
