import { Panel } from "react-resizable-panels";

import PanelGroup from "../../components/AutoSizedPanelGroup";
import Code from "../../components/Code";
import ResizeHandle from "../../components/ResizeHandle";

import styles from "./styles.module.css";

export default function MobileRoute() {
  return (
    <div className={styles.Route}>
      <div className={styles.HeaderContainer}>
        This example is a 3-column horizontal <code>PanelGroup</code>.
      </div>
      <div className={styles.PanelGroupContainer}>
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
      <div className={styles.CodeContainer}>
        <Code className={styles.Code} code={CODE.trim()} language="jsx" />
      </div>
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
