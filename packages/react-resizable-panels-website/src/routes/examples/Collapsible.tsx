import { useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function CollapsibleRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            The example below uses the <code>collapsible</code> prop to enable
            the left and right columns to be collapsed entirely.
          </p>
          <p>
            It also uses the <code>onCollapse</code> prop to update the visual
            style of the resize bar when either panel is collapsed.
          </p>
        </>
      }
    />
  );
}

function Content() {
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);

  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel
          className={styles.PanelRow}
          collapsible={true}
          onCollapse={setCollapsedLeft}
        >
          <div className={styles.Centered}>collapsible</div>
        </Panel>
        <ResizeHandle
          className={styles.ResizeHandle}
          collapsed={collapsedLeft}
        />
        <Panel className={styles.PanelRow}>
          <div className={styles.Centered}>regular</div>
        </Panel>
        <ResizeHandle
          className={styles.ResizeHandle}
          collapsed={collapsedRight}
        />
        <Panel
          className={styles.PanelRow}
          collapsible={true}
          onCollapse={setCollapsedRight}
        >
          <div className={styles.Centered}>collapsible</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="horizontal">
  <Panel collapsible={true}>
    left (collapsible)
  </Panel>
  <ResizeHandle />
  <Panel>
    middle
  </Panel>
  <ResizeHandle />
  <Panel collapsible={true}>
    right (collapsible)
  </Panel>
</PanelGroup>
`;
