import { useState } from "react";
import { Panel } from "react-resizable-panels";

import PanelGroup from "../../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../../components/ResizeHandle";
import Example from "../Example";

import styles from "./styles.module.css";

export default function ConditionalRoute() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  return (
    <Example
      code={CODE}
      exampleNode={
        <Content
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
        />
      }
      headerNode={
        <>
          <p>
            Panels can be conditionally rendered. The <code>order</code> ensures
            they are (re)added in the correct order.
          </p>
          <p>
            If an <code>autoSaveId</code> is provided, layouts will be stored
            separately for each panel combination.
          </p>
          <p>
            <button onClick={() => setShowLeftPanel(!showLeftPanel)}>
              {showLeftPanel ? "Hide" : "Show"} left panel
            </button>
            <button onClick={() => setShowRightPanel(!showRightPanel)}>
              {showLeftPanel ? "Hide" : "Show"} right panel
            </button>
          </p>
        </>
      }
    />
  );
}

function Content({
  showLeftPanel,
  showRightPanel,
}: {
  showLeftPanel: boolean;
  showRightPanel: boolean;
}) {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup
        autoSaveId="conditional"
        className={styles.PanelGroup}
        direction="horizontal"
      >
        {showLeftPanel && (
          <Panel
            className={styles.Panel}
            defaultSize={0.2}
            minSize={0.2}
            order={1}
          >
            <div className={styles.PanelContent}>left</div>
            <ResizeHandle className={styles.ResizeHandle} />
          </Panel>
        )}
        <Panel
          className={styles.Panel}
          defaultSize={0.3}
          minSize={0.3}
          order={2}
        >
          <div className={styles.PanelContent}>middle</div>
        </Panel>
        {showRightPanel && (
          <Panel
            className={styles.Panel}
            defaultSize={0.21}
            minSize={0.21}
            order={3}
          >
            <ResizeHandle className={styles.ResizeHandle} />
            <div className={styles.PanelContent}>right</div>
          </Panel>
        )}
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup autoSaveId="conditional" direction="horizontal">
  {showLeftPanel && (
    <Panel order={1}>
      <div>left</div>
      <ResizeHandle />
    </Panel>
  )}
  <Panel order={2}>
    <div>middle</div>
  </Panel>
  {showRightPanel && (
    <Panel order={3}>
      <ResizeHandle />
      <div>right</div>
    </Panel>
  )}
</PanelGroup>
`;
