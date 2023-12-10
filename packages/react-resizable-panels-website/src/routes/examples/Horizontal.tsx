import { Panel, PanelGroup } from "react-resizable-panels";

import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function HorizontalRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            This example is a 3-column horizontal <code>PanelGroup</code>.
            Click/touch the empty space between the panels and drag to resize.
            Arrow keys can also be used to resize panels.
          </p>
          <p>
            These panels use the <code>minSize</code> property to prevent them
            from being resized smaller than a minimal percentage of the overall
            group.
          </p>
        </>
      }
      title="Horizontal layouts"
    />
  );
}

function Content() {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel className={styles.PanelRow} defaultSize={30} minSize={20}>
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} minSize={30}>
          <div className={styles.Centered}>middle</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} defaultSize={30} minSize={20}>
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="horizontal">
  <Panel defaultSize={30} minSize={20}>
    left
  </Panel>
  <PanelResizeHandle />
  <Panel minSize={30}>
    middle
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={30} minSize={20}>
    right
  </Panel>
</PanelGroup>
`;
