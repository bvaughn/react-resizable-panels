import { useState } from "react";
import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { useGroupRef, usePanelRef } from "react-resizable-panels";
import { html as AnimatedLayoutChangesHTML } from "../../public/generated/examples/AnimatedLayoutChanges.json";
import { DemoButton } from "../components/DemoButton";
import { Link } from "../components/Link";
import { SnapRuler } from "../components/SnapRuler";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

const SNAP_SIZES = [25, 50, 75];

// "!" is needed to override the site's global "transition: none"
const ANIMATED_GROUP_CLASS_NAME =
  "motion-safe:[&:not([data-resizing])>[data-panel]]:[transition:flex-grow_200ms_ease-out]!";

export default function AnimationRoute() {
  const groupRef = useGroupRef();
  const panelRef = usePanelRef();
  const [showRightPanel, setShowRightPanel] = useState(true);

  return (
    <Box direction="column" gap={4}>
      <Header section="Flex" title="Animation" />
      <div>
        Panels are sized using the <code>flex-grow</code> style, so layout
        changes can be animated with a CSS transition. A group has a{" "}
        <code>data-resizing</code> attribute while one of its separators is
        being dragged, and until its initial layout has been applied; leaving
        the transition off then keeps panels from lagging behind the pointer, or
        growing from nothing as the page loads.
      </div>
      <Code html={AnimatedLayoutChangesHTML} />
      <div>
        Every other layout change is animated, including{" "}
        <Link to="/examples/snap-sizes">snapping</Link> once a separator is
        released, the keyboard (focus the separator and press the arrow keys or
        Enter), double-clicking a separator, and the{" "}
        <Link to="/imperative-api/panel">imperative API</Link>:
      </div>
      <SnapRuler horizontal={SNAP_SIZES}>
        <Group
          className={ANIMATED_GROUP_CLASS_NAME}
          groupRef={groupRef}
          snapBehavior="on-release"
        >
          <Panel
            collapsible
            id="left"
            minSize="10%"
            panelRef={panelRef}
            showSizeAsPercentage
            snapSizes={["25%", "50%", "75%"]}
          >
            left
          </Panel>
          <Separator />
          <Panel id="right" showSizeAsPercentage>
            right
          </Panel>
        </Group>
      </SnapRuler>
      <div className="flex flex-wrap gap-2">
        <DemoButton onClick={() => panelRef.current?.collapse()}>
          Collapse
        </DemoButton>
        <DemoButton onClick={() => panelRef.current?.expand()}>
          Expand
        </DemoButton>
        <DemoButton onClick={() => panelRef.current?.resize("75%")}>
          Resize to 75%
        </DemoButton>
        <DemoButton
          onClick={() => groupRef.current?.setLayout({ left: 50, right: 50 })}
        >
          Reset layout
        </DemoButton>
      </div>
      <Callout intent="primary">
        Layout change callbacks (e.g. <code>onLayoutChange</code> and{" "}
        <code>onResize</code>) report the final sizes right away, rather than
        while panels are animating.
      </Callout>
      <Callout>
        Container size changes are animated too. Panels with{" "}
        <Link to="/examples/group-resize-behavior">
          <code>groupResizeBehavior="preserve-pixel-size"</code>
        </Link>{" "}
        and panels with snap sizes change size along with their group, so they
        may lag behind while (for example) the window is being resized.
      </Callout>
      <SectionHeader>Adding and removing panels</SectionHeader>
      <div>
        <Link to="/examples/conditional-panels">Conditionally rendered</Link>{" "}
        panels are animated too. A panel that's added grows from nothing as the
        other panels make room for it, and when a panel is removed, the other
        panels grow to fill its space:
      </div>
      <Group className={ANIMATED_GROUP_CLASS_NAME}>
        <Panel id="conditional-left" minSize="10%" showSizeAsPercentage>
          left
        </Panel>
        <Separator />
        <Panel id="conditional-center" minSize="10%" showSizeAsPercentage>
          center
        </Panel>
        {showRightPanel && (
          <>
            <Separator />
            <Panel id="conditional-right" minSize="10%" showSizeAsPercentage>
              right
            </Panel>
          </>
        )}
      </Group>
      <div>
        <DemoButton onClick={() => setShowRightPanel(!showRightPanel)}>
          {showRightPanel ? "Remove right panel" : "Add right panel"}
        </DemoButton>
      </div>
      <Callout>
        The <Link to="/examples/workspace">Workspace</Link> component's splits
        are groups too, but animating them isn't recommended. Most changes to a
        workspace (e.g. dragging a tab to a new place) change its structure,
        which can't be animated.
      </Callout>
      <div>
        Grids can be animated too (see{" "}
        <Link to="/examples/grid-animation">animating grids</Link>).
      </div>
    </Box>
  );
}
