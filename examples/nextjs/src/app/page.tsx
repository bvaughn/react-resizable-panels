"use client";

import { Panel, PanelGroup, PersistScript } from "react-resizable-panels";
import { ResizeHandle } from "@/components/ResizeHandle";
import styles from "@/components/shared.module.css";

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <main>
        <div className={styles.PanelGroupWrapper}>
          <PanelGroup
            className={styles.PanelGroup}
            autoSaveId="persistence1"
            direction="horizontal"
          >
            <Panel
              className={styles.PanelRow}
              defaultSize={20}
              minSize={10}
              order={1}
            >
              <div className={styles.Centered}>left</div>
            </Panel>
            <ResizeHandle className={styles.ResizeHandle} />
            <Panel
              className={styles.PanelRow}
              minSize={35}
              defaultSize={60}
              order={2}
            >
              <PanelGroup
                className={styles.PanelGroup}
                autoSaveId="persistence2"
                direction="vertical"
              >
                <Panel
                  className={styles.PanelColumn}
                  defaultSize={35}
                  minSize={10}
                  order={1}
                >
                  <div className={styles.Centered}>top</div>
                </Panel>
                <ResizeHandle className={styles.ResizeHandle} />
                <Panel
                  className={styles.PanelColumn}
                  defaultSize={65}
                  minSize={10}
                  order={2}
                >
                  <PanelGroup
                    className={styles.PanelGroup}
                    autoSaveId="persistence3"
                    direction="horizontal"
                  >
                    <Panel
                      className={styles.PanelRow}
                      defaultSize={50}
                      minSize={10}
                      order={1}
                    >
                      <div className={styles.Centered}>left</div>
                    </Panel>
                    <ResizeHandle className={styles.ResizeHandle} />
                    <Panel
                      className={styles.PanelRow}
                      defaultSize={50}
                      minSize={10}
                      order={2}
                    >
                      <div className={styles.Centered}>right</div>
                    </Panel>
                  </PanelGroup>
                </Panel>
              </PanelGroup>
            </Panel>
            <ResizeHandle className={styles.ResizeHandle} />
            <Panel
              className={styles.PanelRow}
              defaultSize={20}
              minSize={10}
              order={3}
            >
              <div className={styles.Centered}>right</div>
            </Panel>
          </PanelGroup>
        </div>
      </main>
    </div>
  );
}
