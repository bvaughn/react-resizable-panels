import { Panel } from "react-resizable-panels";

import PanelGroup from "../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../components/ResizeHandle";

import styles from "./styles.module.css";

export default function MobileRoute() {
  return (
    <div className={styles.Route}>
      <div className={styles.Container}>
        <PanelGroup autoSaveId="mobile-group" direction="horizontal">
          <Panel
            className={styles.Panel}
            defaultSize={0.2}
            id="left"
            minSize={0.2}
            order={1}
          >
            <div className={styles.PanelContent}>left</div>
            <ResizeHandle className={styles.ResizeHandle} id="left" />
          </Panel>
          <Panel
            className={styles.Panel}
            defaultSize={0.4}
            id="middle"
            minSize={0.2}
            order={2}
          >
            <div className={styles.PanelContent}>middle</div>
          </Panel>
          <Panel
            className={styles.Panel}
            defaultSize={0.2}
            id="right"
            minSize={0.2}
            order={3}
          >
            <ResizeHandle className={styles.ResizeHandle} id="right" />
            <div className={styles.PanelContent}>right</div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
