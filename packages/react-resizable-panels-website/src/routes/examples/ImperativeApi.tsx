import { RefObject, useRef } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function ImperativeApiRoute() {
  const panelRef = useRef<ImperativePanelHandle>(null);

  const collapsePanel = () => {
    const panel = panelRef.current;
    if (panel) {
      panel.collapse();
    }
  };

  const expandPanel = () => {
    const panel = panelRef.current;
    if (panel) {
      panel.expand();
    }
  };

  const resizePanel = (size: number) => {
    const panel = panelRef.current;
    if (panel) {
      panel.resize(size);
    }
  };

  return (
    <Example
      code={CODE}
      exampleNode={<Content panelRef={panelRef} />}
      headerNode={
        <>
          <p>
            Sometimes panels need to resize or collapse/expand in response to
            user actions. This can be accomplished using <code>Panel</code>'s
            imperative API, consisting of three methods:
          </p>
          <ul>
            <li>
              <code>collapse()</code>: Collapse the panel to its minimum size.
            </li>
            <li>
              <code>expand()</code>: Expand the panel to its previous size.
            </li>
            <li>
              <code>resize(size)</code>: Resize the panel to the specified size.
            </li>
          </ul>
          <p className={styles.Buttons}>
            <button className={styles.Button} onClick={collapsePanel}>
              Collapse
            </button>
            <button className={styles.Button} onClick={expandPanel}>
              Expand
            </button>
            |
            <button className={styles.Button} onClick={() => resizePanel(10)}>
              Resize: 10
            </button>
            <button className={styles.Button} onClick={() => resizePanel(20)}>
              Resize: 20
            </button>
            <button className={styles.Button} onClick={() => resizePanel(30)}>
              Resize: 30
            </button>
          </p>
        </>
      }
    />
  );
}

function Content({ panelRef }: { panelRef: RefObject<ImperativePanelHandle> }) {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel
          className={styles.PanelRow}
          collapsible
          defaultSize={20}
          maxSize={30}
          minSize={10}
          ref={panelRef}
        >
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow}>
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
const ref = useRef();

const collapsePanel = () => {
  const panel = ref.current;
  if (panel) {
    panel.collapse();
  }
};

<PanelGroup direction="horizontal">
  <Panel collapsible ref={ref}>
    left
  </Panel>
  <ResizeHandle />
  <Panel>
    right
  </Panel>
</PanelGroup>
`;
