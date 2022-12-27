import { Panel, PanelGroup } from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function NestedRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          Layouts are automatically saved when an <code>autoSaveId</code> prop
          is provided. Try this by editing the layout below and then reloading
          the page.
        </>
      }
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
        <Panel className={styles.PanelColumn}>
          <div className={styles.Centered}>left</div>
        </Panel>
        <Panel className={styles.PanelRow}>
          <ResizeHandle className={styles.ResizeHandle} />
          <div className={styles.Centered}>middle</div>
          <ResizeHandle className={styles.ResizeHandle} />
        </Panel>
        <Panel className={styles.PanelColumn}>
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
  <ResizeHandle />
  <Panel>
    middle
  </Panel>
  <ResizeHandle />
  <Panel>
    right
  </Panel>
</PanelGroup>
`;
