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
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  return (
    <Example
      code={CODE}
      exampleNode={
        <Content leftPanelRef={leftPanelRef} rightPanelRef={rightPanelRef} />
      }
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
          <ButtonsRow label="Left panel" panelRef={leftPanelRef} />
          <ButtonsRow label="Right panel" panelRef={rightPanelRef} />
        </>
      }
    />
  );
}

function ButtonsRow({
  label,
  panelRef,
}: {
  label: string;
  panelRef: RefObject<ImperativePanelHandle>;
}) {
  return (
    <p className={styles.Buttons}>
      {label}:
      <button
        className={styles.Button}
        onClick={() => panelRef.current.collapse()}
      >
        Collapse
      </button>
      <button
        className={styles.Button}
        onClick={() => panelRef.current.expand()}
      >
        Expand
      </button>
      |
      <button
        className={styles.Button}
        onClick={() => panelRef.current.resize(10)}
      >
        Resize: 10
      </button>
      <button
        className={styles.Button}
        onClick={() => panelRef.current.resize(20)}
      >
        Resize: 20
      </button>
      <button
        className={styles.Button}
        onClick={() => panelRef.current.resize(30)}
      >
        Resize: 30
      </button>
    </p>
  );
}

function Content({
  leftPanelRef,
  rightPanelRef,
}: {
  leftPanelRef: RefObject<ImperativePanelHandle>;
  rightPanelRef: RefObject<ImperativePanelHandle>;
}) {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel
          className={styles.PanelRow}
          collapsible
          defaultSize={20}
          maxSize={30}
          minSize={10}
          ref={leftPanelRef}
        >
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow}>
          <div className={styles.Centered}>middle</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelRow}
          collapsible
          defaultSize={20}
          maxSize={30}
          minSize={10}
          ref={rightPanelRef}
        >
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
