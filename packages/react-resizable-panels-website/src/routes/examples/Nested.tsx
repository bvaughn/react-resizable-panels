import { Panel, PanelGroup } from "react-resizable-panels";

import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function NestedRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={<p>This example shows nested groups.</p>}
      title="Nested groups"
    />
  );
}

function Content() {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel
          className={styles.PanelRow}
          defaultSizePercentage={20}
          minSizePercentage={10}
        >
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} minSizePercentage={35}>
          <PanelGroup className={styles.PanelGroup} direction="vertical">
            <Panel
              className={styles.PanelColumn}
              defaultSizePercentage={35}
              minSizePercentage={10}
            >
              <div className={styles.Centered}>top</div>
            </Panel>
            <ResizeHandle className={styles.ResizeHandle} />
            <Panel className={styles.PanelColumn} minSizePercentage={10}>
              <PanelGroup className={styles.PanelGroup} direction="horizontal">
                <Panel className={styles.PanelRow} minSizePercentage={10}>
                  <div className={styles.Centered}>left</div>
                </Panel>
                <ResizeHandle className={styles.ResizeHandle} />
                <Panel className={styles.PanelRow} minSizePercentage={10}>
                  <div className={styles.Centered}>right</div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelRow}
          defaultSizePercentage={20}
          minSizePercentage={10}
        >
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="horizontal">
  <Panel>
    left
  </Panel>
  <PanelResizeHandle />
  <Panel>
    <PanelGroup direction="vertical">
      <Panel>
        top
      </Panel>
      <PanelResizeHandle />
      <Panel>
        <PanelGroup direction="horizontal">
          <Panel>
            left
          </Panel>
          <PanelResizeHandle />
          <Panel>
            right
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  </Panel>
  <PanelResizeHandle />
  <Panel>
    right
  </Panel>
</PanelGroup>
`;
