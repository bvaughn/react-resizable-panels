import { ChangeEvent, FormEvent, RefObject, useRef, useState } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";
import Icon from "../../components/Icon";

import { ResizeHandle } from "../../components/ResizeHandle";

import Code from "../../components/Code";
import Example from "./Example";
import styles from "./ImperativePanelApi.module.css";
import sharedStyles from "./shared.module.css";

type Sizes = {
  left: number;
  middle: number;
  right: number;
};

export default function ImperativePanelApiRoute() {
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
            Code resizes the panel to a size that fits all file names. This type
            of interaction can be implemented using the imperative API.
          </p>
          <p>
            <code>Panel</code> provides the following imperative API methods:
          </p>
          <ul>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code="collapse(): void"
                language="typescript"
              />
              Collapse the panel to its minimum size
            </li>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code="expand(minSize?: number): void"
                language="typescript"
              />
              Expand the panel to its previous size (or the min size if there is
              no previous size)
            </li>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code={`getId(): string`}
                language="typescript"
              />
              Panel id
            </li>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code={`getSize(): number`}
                language="typescript"
              />
              Panel's current size in (in both percentage and pixel units)
            </li>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code="isCollapsed(): boolean"
                language="typescript"
              />
              Panel is currently collapsed
            </li>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code="isExpanded(): boolean"
                language="typescript"
              />
              Panel is currently expanded
            </li>
            <li>
              <Code
                className={sharedStyles.InlineCode}
                code={`resize(size: number): void`}
                language="typescript"
              />
              Resize the panel to the specified size (either percentage or pixel
              units)
            </li>
          </ul>
        </>
      }
      language="tsx"
      title="Imperative Panel API"
    />
  );
}

function TogglesRow({
  id,
  panelRef,
  panelSize,
}: {
  id: string;
  panelRef: RefObject<ImperativePanelHandle>;
  panelSize: number;
}) {
  const [size, setSize] = useState(20);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    setSize(parseInt(input.value));
  };

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();

    panelRef.current?.resize(size);
  };

  return (
    <div className={styles.Toggles}>
      <button
        className={
          panelSize === 0 ? sharedStyles.ButtonDisabled : sharedStyles.Button
        }
        data-test-id={`collapse-button-${id}`}
        onClick={() => panelRef.current?.collapse()}
        title={`Collapse ${id} panel`}
      >
        <Icon type="horizontal-collapse" />
      </button>
      <button
        className={
          panelSize !== 0 ? sharedStyles.ButtonDisabled : sharedStyles.Button
        }
        data-test-id={`expand-button-${id}`}
        onClick={() => panelRef.current?.expand()}
        title={`Expand ${id} panel`}
      >
        <Icon type="horizontal-expand" />
      </button>
      <form className={styles.ResizeForm} onSubmit={onFormSubmit}>
        <input
          className={styles.SizeInput}
          data-test-id={`size-input-${id}`}
          onChange={onInputChange}
          min={0}
          max={100}
          size={2}
          type="number"
          value={size}
        />
      </form>
    </div>
  );
}

function Content({
  leftPanelRef,
  middlePanelRef,
  rightPanelRef,
  onResize: onResizeProp,
  sizes,
}: {
  leftPanelRef: RefObject<ImperativePanelHandle>;
  middlePanelRef: RefObject<ImperativePanelHandle>;
  rightPanelRef: RefObject<ImperativePanelHandle>;
  onResize: (partialSizes: Partial<Sizes>) => void;
  sizes: Sizes;
}) {
  const onResize = (partialSizes: Partial<Sizes>) => {
    onResizeProp(partialSizes);
  };

  return (
    <>
      <div className={styles.ToggleRow}>
        <TogglesRow id="left" panelRef={leftPanelRef} panelSize={sizes.left} />
        <TogglesRow
          id="middle"
          panelRef={middlePanelRef}
          panelSize={sizes.middle}
        />
        <TogglesRow
          id="right"
          panelRef={rightPanelRef}
          panelSize={sizes.right}
        />
      </div>
      <div className={sharedStyles.PanelGroupWrapper}>
        <PanelGroup
          autoSaveId="ImperativePanelApi"
          className={sharedStyles.PanelGroup}
          direction="horizontal"
          id="imperative-Panel-api"
        >
          <Panel
            className={sharedStyles.PanelRow}
            collapsible
            defaultSize={20}
            id="left"
            maxSize={30}
            minSize={10}
            onResize={(left) => onResize({ left })}
            order={1}
            ref={leftPanelRef}
          >
            <div className={sharedStyles.Centered}>
              left: {Math.round(sizes.left)}
            </div>
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel
            className={sharedStyles.PanelRow}
            collapsible={true}
            id="middle"
            maxSize={100}
            minSize={10}
            onResize={(middle) => onResize({ middle })}
            order={2}
            ref={middlePanelRef}
          >
            <div className={sharedStyles.Centered}>
              middle: {Math.round(sizes.middle)}
            </div>
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel
            className={sharedStyles.PanelRow}
            collapsible
            defaultSize={20}
            id="right"
            maxSize={100}
            minSize={10}
            onResize={(right) => onResize({ right })}
            order={3}
            ref={rightPanelRef}
          >
            <div className={sharedStyles.Centered}>
              right: {Math.round(sizes.right)}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}

const CODE = `
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
