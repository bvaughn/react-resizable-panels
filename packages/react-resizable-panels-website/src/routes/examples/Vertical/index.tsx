import { Panel } from "react-resizable-panels";

import PanelGroup from "../../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../../components/ResizeHandle";
import Example from "../Example";

import styles from "./styles.module.css";

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
      <PanelGroup
        autoSaveId="mobile-group"
        className={styles.PanelGroup}
        direction="vertical"
      >
        <Panel className={styles.Panel} defaultSize={0.35} minSize={0.35}>
          <div className={styles.PanelContent}>top</div>
          <ResizeHandle className={styles.ResizeHandle} />
        </Panel>
        <Panel className={styles.Panel} defaultSize={0.35} minSize={0.35}>
          <div className={styles.PanelContent}>bottom</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="vertical">
  <Panel>
    <div>top</div>
    <ResizeHandle />
  </Panel>
  <Panel>
    <ResizeHandle />
    <div>bottom</div>
  </Panel>
</PanelGroup>
`;
