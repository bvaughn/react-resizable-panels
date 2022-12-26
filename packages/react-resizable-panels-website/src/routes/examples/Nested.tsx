import { Panel } from "react-resizable-panels";

import PanelGroup from "../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function NestedRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={<>This example shows nested groups.</>}
    />
  );
}

function Content() {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel className={styles.PanelRow} defaultSize={0.2} minSize={0.2}>
          <div className={styles.Centered}>left</div>
          <ResizeHandle className={styles.ResizeHandle} />
        </Panel>
        <Panel className={styles.PanelRow} defaultSize={0.4} minSize={0.2}>
          <PanelGroup className={styles.PanelGroup} direction="vertical">
            <Panel
              className={styles.PanelColumn}
              defaultSize={0.35}
              minSize={0.35}
            >
              <div className={styles.Centered}>top</div>
              <ResizeHandle className={styles.ResizeHandle} />
            </Panel>
            <Panel
              className={styles.PanelColumn}
              defaultSize={0.35}
              minSize={0.35}
            >
              <PanelGroup className={styles.PanelGroup} direction="horizontal">
                <Panel
                  className={styles.PanelRow}
                  defaultSize={0.2}
                  minSize={0.2}
                >
                  <div className={styles.Centered}>left</div>
                  <ResizeHandle className={styles.ResizeHandle} />
                </Panel>
                <Panel
                  className={styles.PanelRow}
                  defaultSize={0.2}
                  minSize={0.2}
                >
                  <div className={styles.Centered}>right</div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </Panel>
        <Panel className={styles.PanelRow} defaultSize={0.2} minSize={0.2}>
          <ResizeHandle className={styles.ResizeHandle} />
          <div className={styles.Centered}>right</div>
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
    <div>
    <PanelGroup direction="vertical">
      <Panel>
        <div>top</div>
        <ResizeHandle />
      </Panel>
      <Panel>
        <ResizeHandle />
        <div>
          <PanelGroup direction="horizontal">
            <Panel>
              <div>left</div>
              <ResizeHandle />
            </Panel>
            <Panel>
              <div>right</div>
            </Panel>
          </PanelGroup>
        </div>
      </Panel>
    </PanelGroup>
    </div>
  </Panel>
  <Panel>
    <ResizeHandle />
    <div>right</div>
  </Panel>
</PanelGroup>
`;
