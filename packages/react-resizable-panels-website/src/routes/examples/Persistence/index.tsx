import { Panel } from "react-resizable-panels";

import PanelGroup from "../../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../../components/ResizeHandle";
import Example from "../Example";

import styles from "./styles.module.css";

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
        <Panel className={styles.PanelColumn} defaultSize={0.2} minSize={0.2}>
          <div className={styles.Centered}>left</div>
        </Panel>
        <Panel className={styles.PanelColumn} defaultSize={0.2} minSize={0.2}>
          <ResizeHandle className={styles.ResizeHandle} />
          <div className={styles.Centered}>middle</div>
          <ResizeHandle className={styles.ResizeHandle} />
        </Panel>
        <Panel className={styles.PanelColumn} defaultSize={0.2} minSize={0.2}>
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup autoSaveId="persistence" direction="horizontal">
  <Panel>
    <div>left</div>
  </Panel>
  <Panel>
    <ResizeHandle />
    <div>middle</div>
    <ResizeHandle />
  </Panel>
  <Panel>
    <div>right</div>
  </Panel>
</PanelGroup>
`;
