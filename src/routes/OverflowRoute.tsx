import {
  Box,
  Callout,
  Code,
  ExternalLink,
  Header,
  Input,
  Tooltip
} from "react-lib-tools";
import { html as GroupAndPanelElementsHTML } from "../../public/generated/examples/GroupAndPanelElements.json";
import { html as PanelDropShadowHTML } from "../../public/generated/examples/PanelDropShadow.json";
import { html as PanelFocusOutlineHTML } from "../../public/generated/examples/PanelFocusOutline.json";
import { html as PanelTooltipHTML } from "../../public/generated/examples/PanelTooltip.json";
import { html as SeparatorFocusOutlineHTML } from "../../public/generated/examples/SeparatorFocusOutline.json";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

const noop = () => {};

export default function OverflowRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Overflow" />
      <div>
        Groups and Panels set the{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow">
          overflow
        </ExternalLink>{" "}
        styles shown below:
      </div>
      <Code html={GroupAndPanelElementsHTML} />
      <div>
        This combination of styles allows overflow content to be scrollable
        while also allowing Panels to have visual styles like shadows or
        outlines.
      </div>
      <div>
        For example, this group of panels demonstrate drop-shadow style.
      </div>
      <Code html={PanelDropShadowHTML} />
      <Group>
        <Panel
          className="bg-fuchsia-600 shadow-md shadow-fuchsia-600/50"
          minSize={100}
        >
          left
        </Panel>
        <Panel
          className="bg-violet-600 shadow-md shadow-violet-600/50"
          minSize={100}
        >
          right
        </Panel>
      </Group>
      <div>And this group demonstrate a focus outline style.</div>
      <Code html={PanelFocusOutlineHTML} />
      <Group>
        <Panel
          className="focus-within:z-10 focus-within:outline-2! outline-offset-2 outline-solid outline-blue-500!"
          minSize={100}
        >
          <Input
            className="focus:border-transparent!"
            onChange={noop}
            placeholder="left input"
            size={10}
            value=""
          />
        </Panel>
        <Panel
          className="focus-within:z-10 focus-within:outline-2! outline-offset-2 outline-solid outline-blue-500!"
          minSize={100}
        >
          <Input
            className="focus:border-transparent!"
            onChange={noop}
            placeholder="right input"
            size={10}
            value=""
          />
        </Panel>
      </Group>
      <Callout>
        The panel sets a higher z-index on <code>focus-within</code> to avoid
        clipping issues.
      </Callout>
      <div>
        Styles that affect the outer panel element (e.g. shadows, outlines) work
        without any customizations. Things like tooltips or popovers that are
        rendered <em>inside</em> of the panel will be clipped by the{" "}
        <code>overflow:auto</code> style. Because of this it's recommended to
        use{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/createPortal">
          portals
        </ExternalLink>{" "}
        for these. However you can override the default style as shown below.
      </div>
      <Code html={PanelTooltipHTML} />
      <Group>
        <Panel className="overflow-visible!" minSize={100}>
          <Tooltip content="This is the left panel" positions={["top"]}>
            left
          </Tooltip>
        </Panel>
        <Panel className="overflow-visible!" minSize={100}>
          <Tooltip content="This is the right panel" positions={["top"]}>
            right
          </Tooltip>
        </Panel>
      </Group>
      <div>All of the above styles also apply to the separator component.</div>
      <Code html={SeparatorFocusOutlineHTML} />
      <Group>
        <Panel minSize={100}>left</Panel>
        <Separator className="focus-within:z-10 focus-within:outline-2! outline-offset-2 outline-solid outline-blue-500!" />
        <Panel minSize={100}>right</Panel>
      </Group>
    </Box>
  );
}
