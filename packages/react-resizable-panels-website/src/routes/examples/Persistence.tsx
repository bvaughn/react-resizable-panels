import { Panel, PanelGroup } from "react-resizable-panels";

import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function NestedRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <p>
          Layouts are automatically saved when an <code>autoSaveId</code> prop
          is provided. Try this by editing the layout below and then reloading
          the page.
        </p>
      }
      title="Persistent layouts"
    />
  );
}

function Content() {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup
        autoSaveId="persistence"
        className={styles.PanelGroup}
        direction="horizontal"
      >
        <Panel className={styles.PanelColumn} minSize={10}>
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} minSize={10}>
          <div className={styles.Centered}>middle</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelColumn} minSize={10}>
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup autoSaveId="persistence" direction="horizontal">
  <Panel>
    left
  </Panel>
  <PanelResizeHandle />
  <Panel>
    middle
  </Panel>
  <PanelResizeHandle />
  <Panel>
    right
  </Panel>
</PanelGroup>
`;
