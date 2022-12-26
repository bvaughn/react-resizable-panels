import { Panel } from "react-resizable-panels";

import PanelGroup from "../../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../../components/ResizeHandle";
import Example from "../Example";

import styles from "./styles.module.css";

export default function HorizontalRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          This example is a 3-column horizontal <code>PanelGroup</code>.
          Click/touch the empty space between the panels and drag to resize.
          Arrow keys can also be used to resize panels.
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
        direction="horizontal"
      >
        <Panel className={styles.Panel} defaultSize={0.2} minSize={0.2}>
          <div className={styles.PanelContent}>left</div>
          <ResizeHandle className={styles.ResizeHandle} />
        </Panel>
        <Panel className={styles.Panel} defaultSize={0.4} minSize={0.2}>
          <div className={styles.PanelContent}>middle</div>
        </Panel>
        <Panel className={styles.Panel} defaultSize={0.2} minSize={0.2}>
          <ResizeHandle className={styles.ResizeHandle} />
          <div className={styles.PanelContent}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="horizontal">
  <Panel>
    <div>left</div>
    <ResizeHandle />
  </Panel>
  <Panel>
    <div>middle</div>
  </Panel>
  <Panel>
    <ResizeHandle />
    <div>right</div>
  </Panel>
</PanelGroup>
`;
