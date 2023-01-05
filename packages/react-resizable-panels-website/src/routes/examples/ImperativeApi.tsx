import { ChangeEvent, RefObject, useRef, useState } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function ImperativeApiRoute() {
  const [leftPanelSize, setLeftPanelSize] = useState(20);
  const [rightPanelSize, setRightPanelSize] = useState(20);

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  return (
    <Example
      code={CODE}
      exampleNode={
        <Content
          leftPanelRef={leftPanelRef}
          leftPanelOnResize={setLeftPanelSize}
          rightPanelRef={rightPanelRef}
          rightPanelOnResize={setRightPanelSize}
        />
      }
      headerNode={
        <>
          <p>
            Sometimes panels need to resize or collapse/expand in response to
            user actions. For example, double-clicking on a resize bar in VS
            Code resizes the panel to a size that fits all file names.
          </p>
          <p>
            This type of interaction can be supported using <code>Panel</code>'s
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
              <code>resize(percentage)</code>: Resize the panel to the specified
              percentage.
            </li>
          </ul>
          <ButtonsRow
            label="Left panel"
            panelRef={leftPanelRef}
            panelSize={leftPanelSize}
          />
          <ButtonsRow
            label="Right panel"
            panelRef={rightPanelRef}
            panelSize={rightPanelSize}
          />
        </>
      }
      language="tsx"
    />
  );
}

function ButtonsRow({
  label,
  panelRef,
  panelSize,
}: {
  label: string;
  panelRef: RefObject<ImperativePanelHandle>;
  panelSize: number;
}) {
  const [size, setSize] = useState(20);
  console.log(label, "size:", size, "panelSize:", panelSize);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    setSize(parseInt(input.value));
  };

  return (
    <span className={styles.Buttons}>
      {label}:
      <button
        className={panelSize === 0 ? styles.ButtonDisabled : styles.Button}
        onClick={() => panelRef.current.collapse()}
      >
        Collapse
      </button>
      <button
        className={panelSize !== 0 ? styles.ButtonDisabled : styles.Button}
        onClick={() => panelRef.current.expand()}
      >
        Expand
      </button>
      |
      <form
        className={styles.ResizeForm}
        onSubmit={(event) => event.preventDefault()}
      >
        <button
          className={panelSize === size ? styles.ButtonDisabled : styles.Button}
          onClick={() => panelRef.current.resize(size)}
        >
          Resize to:
        </button>
        <input
          className={styles.SizeInput}
          onChange={onChange}
          min={0}
          max={100}
          size={2}
          type="number"
          value={size}
        />
        %
      </form>
    </span>
  );
}

function Content({
  leftPanelRef,
  leftPanelOnResize,
  rightPanelRef,
  rightPanelOnResize,
}: {
  leftPanelRef: RefObject<ImperativePanelHandle>;
  leftPanelOnResize: (size: number) => void;
  rightPanelRef: RefObject<ImperativePanelHandle>;
  rightPanelOnResize: (size: number) => void;
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
          onResize={leftPanelOnResize}
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
          onResize={rightPanelOnResize}
          ref={rightPanelRef}
        >
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
// TypeScript syntax shown below

import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

const ref = useRef<ImperativePanelHandle>(null);

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
  <PanelResizeHandle />
  <Panel>
    right
  </Panel>
</PanelGroup>
`;
