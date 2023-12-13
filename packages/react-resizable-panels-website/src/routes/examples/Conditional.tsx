import { useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

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
          <p className={styles.Buttons}>
            <button
              className={styles.Button}
              onClick={() => setShowLeftPanel(!showLeftPanel)}
            >
              {showLeftPanel ? "Hide" : "Show"} left panel
            </button>
            <button
              className={styles.Button}
              onClick={() => setShowRightPanel(!showRightPanel)}
            >
              {showRightPanel ? "Hide" : "Show"} right panel
            </button>
          </p>
        </>
      }
      title="Conditional panels"
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
          <>
            <Panel className={styles.Panel} id="left" minSize={10} order={1}>
              <div className={styles.Centered}>left</div>
            </Panel>
            <ResizeHandle className={styles.ResizeHandle} />
          </>
        )}
        <Panel className={styles.Panel} id="center" minSize={10} order={2}>
          <div className={styles.Centered}>middle</div>
        </Panel>
        {showRightPanel && (
          <>
            <ResizeHandle className={styles.ResizeHandle} />
            <Panel className={styles.Panel} id="right" minSize={10} order={3}>
              <div className={styles.Centered}>right</div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup autoSaveId="conditional" direction="horizontal">
  {showLeftPanel && (
    <>
      <Panel id="left" order={1}>
        left
      </Panel>
      <PanelResizeHandle />
    </>
  )}
  <Panel id="center" order={2}>
    middle
  </Panel>
  {showRightPanel && (
    <>
      <PanelResizeHandle />
      <Panel id="right" order={3}>
        right
      </Panel>
    </>
  )}
</PanelGroup>
`;
