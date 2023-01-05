import { ChangeEvent, RefObject, useRef, useState } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";
import Icon from "../../components/Icon";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

type Sizes = {
  left: number;
  middle: number;
  right: number;
};

export default function ImperativeApiRoute() {
  const [sizes, setSizes] = useState<Sizes>({
    left: 20,
    middle: 60,
    right: 20,
  });

  const onResize = (partialSizes: Partial<Sizes>) => {
    setSizes((prevSizes: Sizes) => ({
      ...prevSizes,
      ...partialSizes,
    }));
  };

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const middlePanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  return (
    <Example
      code={CODE}
      exampleNode={
        <Content
          leftPanelRef={leftPanelRef}
          middlePanelRef={middlePanelRef}
          rightPanelRef={rightPanelRef}
          onResize={onResize}
          sizes={sizes}
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
            id="left"
            panelRef={leftPanelRef}
            panelSize={sizes.left}
          />
          <ButtonsRow
            id="middle"
            panelRef={middlePanelRef}
            panelSize={sizes.middle}
          />
          <ButtonsRow
            id="right"
            panelRef={rightPanelRef}
            panelSize={sizes.right}
          />
        </>
      }
      language="tsx"
    />
  );
}

function ButtonsRow({
  id,
  panelRef,
  panelSize,
}: {
  id: string;
  panelRef: RefObject<ImperativePanelHandle>;
  panelSize: number;
}) {
  const [size, setSize] = useState(20);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    setSize(parseInt(input.value));
  };

  return (
    <span className={styles.Buttons}>
      <span className={styles.Capitalize}>{id}</span>
      <button
        className={panelSize === 0 ? styles.ButtonDisabled : styles.Button}
        data-test-id={`collapse-button-${id}`}
        onClick={() => panelRef.current.collapse()}
        title="Collapse panel"
      >
        <Icon type="horizontal-collapse" />
      </button>
      <button
        className={panelSize !== 0 ? styles.ButtonDisabled : styles.Button}
        data-test-id={`expand-button-${id}`}
        onClick={() => panelRef.current.expand()}
        title="Expand panel"
      >
        <Icon type="horizontal-expand" />
      </button>
      <form
        className={styles.ResizeForm}
        onSubmit={(event) => event.preventDefault()}
      >
        <button
          className={panelSize === size ? styles.ButtonDisabled : styles.Button}
          data-test-id={`resize-button-${id}`}
          onClick={() => panelRef.current.resize(size)}
        >
          Resize to:
        </button>
        <input
          className={styles.SizeInput}
          data-test-id={`size-input-${id}`}
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
  middlePanelRef,
  rightPanelRef,
  onResize,
  sizes,
}: {
  leftPanelRef: RefObject<ImperativePanelHandle>;
  middlePanelRef: RefObject<ImperativePanelHandle>;
  rightPanelRef: RefObject<ImperativePanelHandle>;
  onResize: (partialSizes: Partial<Sizes>) => void;
  sizes: Sizes;
}) {
  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel
          className={styles.PanelRow}
          collapsible
          defaultSize={sizes.left}
          maxSize={30}
          minSize={10}
          onResize={(left: number) => onResize({ left })}
          order={1}
          ref={leftPanelRef}
        >
          <div className={styles.Centered}>left: {Math.round(sizes.left)}</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelRow}
          collapsible
          maxSize={100}
          minSize={10}
          onResize={(middle: number) => onResize({ middle })}
          order={2}
          ref={middlePanelRef}
        >
          <div className={styles.Centered}>
            middle: {Math.round(sizes.middle)}
          </div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelRow}
          collapsible
          defaultSize={sizes.right}
          maxSize={100}
          minSize={10}
          onResize={(right: number) => onResize({ right })}
          order={3}
          ref={rightPanelRef}
        >
          <div className={styles.Centered}>
            right: {Math.round(sizes.right)}
          </div>
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
