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
            autoSaveId="l1"
            direction="horizontal"
          >
            <PersistScript autoSaveId="l1" />
            <Panel
              className={styles.PanelRow}
              defaultSize={20}
              minSize={10}
              id="l1:left"
              suppressHydrationWarning
            >
              <div className={styles.Centered}>left</div>
            </Panel>
            <ResizeHandle className={styles.ResizeHandle} />
            <Panel
              className={styles.PanelRow}
              minSize={35}
              defaultSize={60}
              id="l1:middle"
              suppressHydrationWarning
            >
              <PanelGroup
                className={styles.PanelGroup}
                autoSaveId="l2"
                direction="vertical"
              >
                <PersistScript autoSaveId="l2" />
                <Panel
                  className={styles.PanelColumn}
                  defaultSize={35}
                  minSize={10}
                  id="l2:top"
                  suppressHydrationWarning
                >
                  <div className={styles.Centered}>top</div>
                </Panel>
                <ResizeHandle className={styles.ResizeHandle} />
                <Panel
                  className={styles.PanelColumn}
                  defaultSize={65}
                  minSize={10}
                  id="l2:bottom"
                  suppressHydrationWarning
                >
                  <PanelGroup
                    className={styles.PanelGroup}
                    autoSaveId="l3"
                    direction="horizontal"
                  >
                    <PersistScript autoSaveId="l3" />
                    <Panel
                      className={styles.PanelRow}
                      defaultSize={50}
                      minSize={10}
                      id="l3:left"
                      suppressHydrationWarning
                    >
                      <div className={styles.Centered}>left</div>
                    </Panel>
                    <ResizeHandle className={styles.ResizeHandle} />
                    <Panel
                      className={styles.PanelRow}
                      defaultSize={50}
                      minSize={10}
                      id="l3:right"
                      suppressHydrationWarning
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
              id="l1:right"
              suppressHydrationWarning
            >
              <div className={styles.Centered}>right</div>
            </Panel>
          </PanelGroup>
        </div>
      </main>
    </div>
  );
}
