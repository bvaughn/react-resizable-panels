import {
  CustomCursorStyleConfig,
  customizeGlobalCursorStyles,
  Panel,
  PanelGroup,
} from "react-resizable-panels";

import { ResizeHandle } from "../../components/ResizeHandle";

import { useLayoutEffect } from "react";
import Example from "./Example";
import styles from "./shared.module.css";

export default function CustomCursorExampleRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            By default, this library manages cursor styles in response to user
            input. You <em>can</em> override the default cursor for advanced use
            cases, though it's generally not recommended.
          </p>
        </>
      }
      title="Custom cursor"
    />
  );
}

function Content() {
  useLayoutEffect(() => {
    function customCursor({ isPointerDown }: CustomCursorStyleConfig) {
      return isPointerDown ? "grabbing" : "grab";
    }

    customizeGlobalCursorStyles(customCursor);
    return () => {
      customizeGlobalCursorStyles(null);
    };
  }, []);

  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup className={styles.PanelGroup} direction="horizontal">
        <Panel className={styles.PanelRow} minSize={10}>
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} minSize={10}>
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
import { customizeGlobalCursorStyles, type CustomCursorStyleConfig } from "react-resizable-panels";

function Example() {
  useLayoutEffect(() => {
    function customCursor({ isPointerDown }: CustomCursorStyleConfig) {
      return isPointerDown ? "grabbing" : "grab";
    }

    customizeGlobalCursorStyles(customCursor);
    return () => {
      customizeGlobalCursorStyles(null);
    };
  }, []);

  // ...
}
`;
