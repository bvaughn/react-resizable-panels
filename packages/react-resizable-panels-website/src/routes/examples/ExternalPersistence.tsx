import { useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";
import useDebouncedCallback from "../../hooks/useDebouncedCallback";

import Example from "./Example";
import styles from "./shared.module.css";

export default function ExternalPersistence() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            By default, <code>PanelGroup</code>s can be configured to remember
            layouts using <code>localStorage</code>. This example shows how the{" "}
            <code>defaultSize</code> and <code>onResize</code> props can be used
            to persist layouts somewhere custom/external. In this case, sizes
            are saved as part of the URL hash after a debounce duration of{" "}
            <strong>500ms</strong>.
          </p>
          <p className={styles.WarningBlock}>
            ⚠ Note that when the <code>onResize</code> prop is used, the
            <code>order</code> prop must also be provided.
          </p>
        </>
      }
    />
  );
}

type Sizes = {
  left: number;
  middle: number;
  right: number;
};

const DefaultSizes: Sizes = {
  left: 33,
  middle: 34,
  right: 33,
};

function Content() {
  const [sizes, saveSizes] = useState<Sizes>(() => {
    if (window.location.hash) {
      try {
        return JSON.parse(decodeURI(window.location.hash.substring(1)));
      } catch (error) {
        console.error(error);
      }
    }

    return DefaultSizes;
  });

  const onResize = (partialSizes: Partial<Sizes>) => {
    saveSizes((prevSizes) => ({
      ...prevSizes,
      ...partialSizes,
    }));
  };

  const onLayout = useDebouncedCallback((sizesArray: number[]) => {
    const sizesObject: Sizes = {
      left: sizesArray[0],
      middle: sizesArray[1],
      right: sizesArray[2],
    };

    const encoded = encodeURI(JSON.stringify(sizesObject));

    // Update the hash without interfering with the browser's Back button.
    history.replaceState(undefined, undefined, `#${encoded}`);
  }, 500);

  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup
        className={styles.PanelGroup}
        direction="horizontal"
        onLayout={onLayout}
      >
        <Panel
          className={styles.PanelRow}
          collapsible={true}
          defaultSize={sizes.left}
          onResize={(left: number) => onResize({ left })}
          order={1}
        >
          <div className={styles.Centered}>left: {Math.round(sizes.left)}</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelRow}
          defaultSize={sizes.middle}
          onResize={(middle: number) => onResize({ middle })}
          order={2}
        >
          <div className={styles.Centered}>
            middle: {Math.round(sizes.middle)}
          </div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel
          className={styles.PanelRow}
          collapsible={true}
          defaultSize={sizes.right}
          onResize={(right: number) => onResize({ right })}
          order={3}
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
<PanelGroup direction="horizontal">
  <Panel defaultSize={sizeLeft} onResize={saveSizeLeft} order={1}>
    left
  </Panel>
  <ResizeHandle />
  <Panel defaultSize={sizeMiddle} onResize={saveSizeMiddle} order={2}>
    left
  </Panel>
  <ResizeHandle />
  <Panel defaultSize={sizeRight} onResize={saveSizeRight} order={3}>
    right
  </Panel>
</PanelGroup>
`;
