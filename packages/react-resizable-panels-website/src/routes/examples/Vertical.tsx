import {
  new_Panel as Panel,
  new_PanelGroup as PanelGroup,
} from "react-resizable-panels";

import { new_ResizeHandle as ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function VerticalRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            This example is a 2-row vertical <code>PanelGroup</code>.
            Click/touch the empty space between the panels and drag to resize.
            Arrow keys can also be used to resize panels.
          </p>
          <p>
            These panels use the <code>maxSize</code> property to prevent them
            from being resized larger than a maximal percentage of the overall
            group.
          </p>
        </>
      }
      title="Vertical layouts"
    />
  );
}

function Content() {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="vertical">
        <Panel
          className={styles.PanelColumn}
          defaultSizePercentage={50}
          maxSizePercentage={75}
          minSizePercentage={10}
        >
          <div className={styles.Centered}>top</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelColumn}
          maxSizePercentage={75}
          minSizePercentage={10}
        >
          <div className={styles.Centered}>bottom</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="vertical">
  <Panel maxSizePercentage={75}>
    top
  </Panel>
  <PanelResizeHandle />
  <Panel maxSizePercentage={75}>
    bottom
  </Panel>
</PanelGroup>
`;
