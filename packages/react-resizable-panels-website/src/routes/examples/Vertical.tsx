import { Panel, PanelGroup } from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function VerticalRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          This example is a 2-row vertical <code>PanelGroup</code>. Click/touch
          the empty space between the panels and drag to resize. Arrow keys can
          also be used to resize panels.
        </>
      }
    />
  );
}

function Content() {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="vertical">
        <Panel className={styles.PanelColumn} defaultSize={50}>
          <div className={styles.Centered}>top</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelColumn}>
          <div className={styles.Centered}>bottom</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="vertical">
  <Panel>
    top
  </Panel>
  <ResizeHandle />
  <Panel>
    bottom
  </Panel>
</PanelGroup>
`;
