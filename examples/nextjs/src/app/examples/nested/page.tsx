"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "@/components/shared.module.css";

export default function NestedExample() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Nested Resizable Panels</h1>
      <p>
        This example shows nested groups. Click near the intersection of two
        groups to resize in multiple directions at once.
      </p>

      <div className={styles.PanelGroupWrapper}>
        <PanelGroup
          className={styles.PanelGroup}
          autoSaveId="nested-example-persistence1"
          direction="horizontal"
        >
          <Panel className={styles.PanelRow} defaultSize={20} minSize={10}>
            <div className={styles.Centered}>left</div>
          </Panel>
          <PanelResizeHandle />
          <Panel className={styles.PanelRow} minSize={35}>
            <PanelGroup
              className={styles.PanelGroup}
              autoSaveId="nested-example-persistence2"
              direction="vertical"
            >
              <Panel
                className={styles.PanelColumn}
                defaultSize={35}
                minSize={10}
              >
                <div className={styles.Centered}>top</div>
              </Panel>
              <PanelResizeHandle />
              <Panel className={styles.PanelColumn} minSize={10}>
                <PanelGroup
                  className={styles.PanelGroup}
                  direction="horizontal"
                >
                  <Panel className={styles.PanelRow} minSize={10}>
                    <div className={styles.Centered}>inner left</div>
                  </Panel>
                  <PanelResizeHandle />
                  <Panel className={styles.PanelRow} minSize={10}>
                    <div className={styles.Centered}>inner right</div>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle />
          <Panel className={styles.PanelRow} defaultSize={20} minSize={10}>
            <div className={styles.Centered}>right</div>
          </Panel>
        </PanelGroup>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Features:</h2>
        <ul>
          <li>Three levels of nested panel groups</li>
          <li>Horizontal and vertical resize handles</li>
          <li>Persistent layout state using localStorage</li>
          <li>Minimum size constraints on panels</li>
          <li>Responsive design with proper CSS variables</li>
        </ul>

        <div style={{ marginTop: "1rem" }}>
          <a href="/" style={{ color: "var(--color-link)" }}>
            ← Back to simple example
          </a>
        </div>
      </div>
    </div>
  );
}
