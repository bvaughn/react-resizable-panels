import {
  ChangeEvent,
  FormEvent,
  RefObject,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";
import Icon from "../../components/Icon";

import ResizeHandle from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./ImperativeApi.module.css";
import sharedStyles from "./shared.module.css";
import { LogEntry } from "./types";

const url = new URL(location.href);
const collapseByDefault = url.searchParams.has("collapse");

type Sizes = {
  left: number;
  middle: number;
  right: number;
};

export default function ImperativeApiRoute() {
  const [sizes, setSizes] = useState<Sizes>({
    left: collapseByDefault ? 0 : 20,
    middle: collapseByDefault ? 100 : 60,
    right: collapseByDefault ? 0 : 20,
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
        </>
      }
      language="tsx"
      title="Imperative API"
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

    panelRef.current.resize(size);
  };

  return (
    <div className={styles.Toggles}>
      <button
        className={
          panelSize === 0 ? sharedStyles.ButtonDisabled : sharedStyles.Button
        }
        data-test-id={`collapse-button-${id}`}
        onClick={() => panelRef.current.collapse()}
        title={`Collapse ${id} panel`}
      >
        <Icon type="horizontal-collapse" />
      </button>
      <button
        className={
          panelSize !== 0 ? sharedStyles.ButtonDisabled : sharedStyles.Button
        }
        data-test-id={`expand-button-${id}`}
        onClick={() => panelRef.current.expand()}
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

// Used for e2e testing only
function logDebug(div: HTMLDivElement, data: Object) {
  try {
  } catch (error) {}
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
  // Used for e2e testing only
  const debugRef = useRef<ImperativeDebugApi>(null);

  const onLayout = (sizes: []) => {
    const debug = debugRef.current;
    if (debug) {
      debug.log({ type: "onLayout", sizes });
    }
  };

  const onCollapse = (id: string, collapsed: boolean) => {
    const debug = debugRef.current;
    if (debug) {
      debug.log({
        collapsed,
        panelId: id,
        type: "onCollapse",
      });
    }
  };

  const onResize = (partialSizes: Partial<Sizes>) => {
    const id = Object.keys(partialSizes)[0];
    const size = Object.values(partialSizes)[0];
    const debug = debugRef.current;
    if (debug) {
      debug.log({
        panelId: id,
        size,
        type: "onResize",
      });
    }

    onResizeProp(partialSizes);
  };

  return (
    <>
      <Debug apiRef={debugRef} />
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
          className={sharedStyles.PanelGroup}
          direction="horizontal"
          onLayout={onLayout}
        >
          <Panel
            className={sharedStyles.PanelRow}
            collapsible
            defaultSize={sizes.left}
            id="left"
            maxSize={30}
            minSize={10}
            onCollapse={(collapsed: boolean) => onCollapse("left", collapsed)}
            onResize={(left: number) => onResize({ left })}
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
            collapsible
            id="middle"
            maxSize={100}
            minSize={10}
            onCollapse={(collapsed: boolean) => onCollapse("middle", collapsed)}
            onResize={(middle: number) => onResize({ middle })}
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
            defaultSize={sizes.right}
            id="right"
            maxSize={100}
            minSize={10}
            onCollapse={(collapsed: boolean) => onCollapse("right", collapsed)}
            onResize={(right: number) => onResize({ right })}
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

type ImperativeDebugApi = {
  log: (logEntry: LogEntry) => void;
};

// Used for e2e testing only
function Debug({ apiRef }: { apiRef: RefObject<ImperativeDebugApi> }) {
  const ref = useRef<HTMLDivElement>(null);

  useImperativeHandle(apiRef, () => ({
    log: (logEntry: LogEntry) => {
      const div = ref.current;
      if (div) {
        try {
          let objectsArray: LogEntry[] = [];

          const textContent = div.textContent.trim();
          if (textContent !== "") {
            objectsArray = JSON.parse(textContent) as LogEntry[];
          }

          objectsArray.push(logEntry);

          div.textContent = JSON.stringify(objectsArray);
        } catch (error) {}
      }
    },
  }));

  return <div id="debug" ref={ref} style={{ display: "none" }}></div>;
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
