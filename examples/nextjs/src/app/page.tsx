"use client";

import { Panel, PanelGroup, PanelPersistScript } from "react-resizable-panels";
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
            <Panel
              className={styles.PanelRow}
              defaultSize={20}
              minSize={10}
              order={1}
              id="l1:left"
            >
              <PanelPersistScript panelId="l1:left" autoSaveId="l1" />
              <div className={styles.Centered}>left</div>
            </Panel>
            <ResizeHandle className={styles.ResizeHandle} />
            <Panel
              className={styles.PanelRow}
              minSize={35}
              defaultSize={60}
              order={2}
              id="l1:middle"
            >
              <PanelPersistScript panelId="l1:middle" autoSaveId="l1" />
              <PanelGroup
                className={styles.PanelGroup}
                autoSaveId="l2"
                direction="vertical"
              >
                <Panel
                  className={styles.PanelColumn}
                  defaultSize={35}
                  minSize={10}
                  order={1}
                  id="l2:top"
                >
                  <PanelPersistScript panelId="l2:top" autoSaveId="l2" />
                  <div className={styles.Centered}>top</div>
                </Panel>
                <ResizeHandle className={styles.ResizeHandle} />
                <Panel
                  className={styles.PanelColumn}
                  defaultSize={65}
                  minSize={10}
                  order={2}
                  id="l2:bottom"
                >
                  <PanelPersistScript panelId="l2:bottom" autoSaveId="l2" />
                  <PanelGroup
                    className={styles.PanelGroup}
                    autoSaveId="l3"
                    direction="horizontal"
                  >
                    <Panel
                      className={styles.PanelRow}
                      defaultSize={50}
                      minSize={10}
                      order={1}
                      id="l3:left"
                    >
                      <PanelPersistScript panelId="l3:left" autoSaveId="l3" />
                      <div className={styles.Centered}>left</div>
                    </Panel>
                    <ResizeHandle className={styles.ResizeHandle} />
                    <Panel
                      className={styles.PanelRow}
                      defaultSize={50}
                      minSize={10}
                      order={2}
                      id="l3:right"
                    >
                      <PanelPersistScript panelId="l3:right" autoSaveId="l3" />
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
              id="l1:right"
            >
              <PanelPersistScript panelId="l1:right" autoSaveId="l1" />
              <div className={styles.Centered}>right</div>
            </Panel>
          </PanelGroup>
        </div>
      </main>
    </div>
  );
}
